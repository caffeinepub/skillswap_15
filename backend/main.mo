import Text "mo:core/Text";
import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Types
  public type Skill = {
    name : Text;
    category : Text;
    description : Text;
    proficiency : Nat;
  };

  public type Message = {
    from : Principal;
    to : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  public type Rating = {
    from : Principal;
    to : Principal;
    rating : Nat; // 1-5
    review : Text;
    timestamp : Time.Time;
  };

  public type ExchangeRequest = {
    from : Principal;
    to : Principal;
    fromOfferedSkill : Text;
    fromWantedSkill : Text;
    toOfferedSkill : Text;
    toWantedSkill : Text;
    timestamp : Time.Time;
  };

  public type UserProfile = {
    name : Text;
    bio : Text;
    offeredSkills : [Skill];
    wantedSkills : [Skill];
  };

  public type CanonicalPrincipalPair = (Principal, Principal);

  module CanonicalPrincipalPair {
    public func compare(a : CanonicalPrincipalPair, b : CanonicalPrincipalPair) : Order.Order {
      switch (Principal.compare(a.0, b.0)) {
        case (#less) { #less };
        case (#greater) { #greater };
        case (#equal) { Principal.compare(a.1, b.1) };
      };
    };
  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let profiles = Map.empty<Principal, UserProfile>();
  let messages = Map.empty<CanonicalPrincipalPair, List.List<Message>>();
  let ratings = Map.empty<CanonicalPrincipalPair, List.List<Rating>>();
  let exchangeRequests = Map.empty<Principal, List.List<ExchangeRequest>>();
  // Tracks accepted matches: key is canonical (smaller, larger) pair
  let acceptedMatches = Map.empty<CanonicalPrincipalPair, Bool>();

  // Helper: canonical key so (a,b) and (b,a) map to the same entry
  func canonicalKey(a : Principal, b : Principal) : CanonicalPrincipalPair {
    if (a.toText() <= b.toText()) {
      (a, b);
    } else {
      (b, a);
    };
  };

  func hasAcceptedMatch(a : Principal, b : Principal) : Bool {
    let key = canonicalKey(a, b);
    switch (acceptedMatches.get(key)) {
      case (?true) { true };
      case (_) { false };
    };
  };

  // ── Profile Management ──────────────────────────────────────────────────────

  /// Required by frontend: get the caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    profiles.get(caller);
  };

  /// Required by frontend: save the caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  /// Create or update the caller's profile (extended version with individual fields)
  public shared ({ caller }) func createOrUpdateProfile(name : Text, bio : Text, offeredSkills : [Skill], wantedSkills : [Skill]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create or update profiles");
    };
    let profile : UserProfile = {
      name;
      bio;
      offeredSkills;
      wantedSkills;
    };
    profiles.add(caller, profile);
  };

  /// Fetch any user's profile — public browsing, no auth required
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    profiles.get(user);
  };

  /// Alias kept for backward compatibility — public browsing, no auth required
  public query ({ caller }) func getProfile(user : Principal) : async ?UserProfile {
    profiles.get(user);
  };

  /// Browse all profiles — public browsing, no auth required
  public query ({ caller }) func getAllProfiles() : async [(Principal, UserProfile)] {
    profiles.toArray();
  };

  // ── Skill Browsing / Searching ──────────────────────────────────────────────

  /// Search offered skills by name or category — public, no auth required
  public query ({ caller }) func searchSkills(searchTerm : Text) : async [Skill] {
    let results = List.empty<Skill>();
    let lowerTerm = searchTerm.toLower();

    for ((_, profile) in profiles.entries()) {
      for (skill in profile.offeredSkills.values()) {
        if (
          skill.name.toLower().contains(#text lowerTerm) or
          skill.category.toLower().contains(#text lowerTerm)
        ) {
          results.add(skill);
        };
      };
    };
    results.toArray();
  };

  // ── Exchange Matching ───────────────────────────────────────────────────────

  /// Send an exchange request — requires #user role
  public shared ({ caller }) func sendExchangeRequest(toUser : Principal, fromOfferedSkill : Text, fromWantedSkill : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send exchange requests");
    };

    if (Principal.equal(caller, toUser)) {
      Runtime.trap("Cannot send an exchange request to yourself");
    };

    let toProfile = switch (profiles.get(toUser)) {
      case (null) { Runtime.trap("Recipient profile not found") };
      case (?profile) { profile };
    };

    let matchingOfferedSkill = toProfile.offeredSkills.find(func(skill : Skill) : Bool { skill.name == fromWantedSkill });
    let matchingWantedSkill = toProfile.wantedSkills.find(func(skill : Skill) : Bool { skill.name == fromOfferedSkill });

    if (matchingOfferedSkill != null and matchingWantedSkill != null) {
      let exchangeRequest : ExchangeRequest = {
        from = caller;
        to = toUser;
        fromOfferedSkill;
        fromWantedSkill;
        toOfferedSkill = fromWantedSkill;
        toWantedSkill = fromOfferedSkill;
        timestamp = Time.now();
      };

      // Add to recipient's incoming requests
      let recipientRequests = switch (exchangeRequests.get(toUser)) {
        case (null) { List.empty<ExchangeRequest>() };
        case (?requests) { requests };
      };
      recipientRequests.add(exchangeRequest);
      exchangeRequests.add(toUser, recipientRequests);
    } else {
      Runtime.trap("Skills are not complementary — no match found");
    };
  };

  /// Accept an exchange request — requires #user role; caller must be the recipient
  public shared ({ caller }) func acceptExchangeRequest(fromUser : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept exchange requests");
    };

    // Verify the request exists
    let callerRequests = switch (exchangeRequests.get(caller)) {
      case (null) { Runtime.trap("No exchange requests found") };
      case (?reqs) { reqs };
    };

    let requestExists = callerRequests.find(func(req : ExchangeRequest) : Bool {
      Principal.equal(req.from, fromUser) and Principal.equal(req.to, caller);
    });

    switch (requestExists) {
      case (null) { Runtime.trap("Exchange request not found") };
      case (?_) {
        // Mark the match as accepted
        let key = canonicalKey(caller, fromUser);
        acceptedMatches.add(key, true);
        // Initialize message thread if not already present
        if (not messages.containsKey(key)) {
          messages.add(key, List.empty<Message>());
        };
      };
    };
  };

  /// Get exchange requests addressed to the caller — requires #user role
  public query ({ caller }) func getMyExchangeRequests() : async [ExchangeRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their exchange requests");
    };
    switch (exchangeRequests.get(caller)) {
      case (null) { [] };
      case (?reqs) { reqs.toArray() };
    };
  };

  // ── Messaging ───────────────────────────────────────────────────────────────

  /// Send a message — requires #user role AND an accepted match between caller and toUser
  public shared ({ caller }) func sendMessage(toUser : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    if (not hasAcceptedMatch(caller, toUser)) {
      Runtime.trap("Unauthorized: You can only message users with whom you have an accepted exchange match");
    };

    let key = canonicalKey(caller, toUser);
    let messagesList = switch (messages.get(key)) {
      case (?existing) { existing };
      case (null) { List.empty<Message>() };
    };

    let message : Message = {
      from = caller;
      to = toUser;
      content;
      timestamp = Time.now();
    };
    messagesList.add(message);
    messages.add(key, messagesList);
  };

  /// Get messages with another user — requires #user role AND caller must be a participant
  public query ({ caller }) func getMessages(withUser : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can read messages");
    };

    if (not hasAcceptedMatch(caller, withUser)) {
      Runtime.trap("Unauthorized: You can only view messages with users you have an accepted exchange match with");
    };

    let key = canonicalKey(caller, withUser);
    switch (messages.get(key)) {
      case (?msgs) { msgs.toArray() };
      case (null) { [] };
    };
  };

  // ── Ratings and Reviews ─────────────────────────────────────────────────────

  /// Leave a rating for another user — requires #user role
  public shared ({ caller }) func leaveRating(toUser : Principal, rating : Nat, review : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can leave ratings");
    };

    if (Principal.equal(caller, toUser)) {
      Runtime.trap("Cannot rate yourself");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    // Only participants of an accepted match may rate each other
    if (not hasAcceptedMatch(caller, toUser)) {
      Runtime.trap("Unauthorized: You can only rate users with whom you have completed an exchange");
    };

    let ratingObj : Rating = {
      from = caller;
      to = toUser;
      rating;
      review;
      timestamp = Time.now();
    };

    let userRatings = switch (ratings.get((caller, toUser))) {
      case (null) { List.empty<Rating>() };
      case (?rs) { rs };
    };
    userRatings.add(ratingObj);
    ratings.add((caller, toUser), userRatings);
  };

  /// Get all ratings received by a user — public, no auth required
  public query ({ caller }) func getUserRatings(user : Principal) : async [Rating] {
    let userRatings = List.empty<Rating>();
    for (((_, to), ratingsList) in ratings.entries()) {
      if (Principal.equal(to, user)) {
        userRatings.addAll(ratingsList.values());
      };
    };
    userRatings.toArray();
  };

  /// Get the average rating for a user — public, no auth required
  public query ({ caller }) func getAverageRating(user : Principal) : async ?Float {
    var sum = 0;
    var count = 0;

    for (((_, to), ratingsList) in ratings.entries()) {
      if (Principal.equal(to, user)) {
        for (r in ratingsList.values()) {
          sum += r.rating;
          count += 1;
        };
      };
    };

    if (count == 0) {
      null;
    } else {
      ?(sum.toFloat() / count.toFloat());
    };
  };
};
