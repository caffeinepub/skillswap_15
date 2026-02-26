import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ExchangeRequest {
    to: Principal;
    fromOfferedSkill: string;
    from: Principal;
    timestamp: Time;
    toWantedSkill: string;
    toOfferedSkill: string;
    fromWantedSkill: string;
}
export type Time = bigint;
export interface Rating {
    to: Principal;
    review: string;
    from: Principal;
    timestamp: Time;
    rating: bigint;
}
export interface Skill {
    name: string;
    description: string;
    proficiency: bigint;
    category: string;
}
export interface Message {
    to: Principal;
    content: string;
    from: Principal;
    timestamp: Time;
}
export interface UserProfile {
    bio: string;
    name: string;
    offeredSkills: Array<Skill>;
    wantedSkills: Array<Skill>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Accept an exchange request — requires #user role; caller must be the recipient
     */
    acceptExchangeRequest(fromUser: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Create or update the caller's profile (extended version with individual fields)
     */
    createOrUpdateProfile(name: string, bio: string, offeredSkills: Array<Skill>, wantedSkills: Array<Skill>): Promise<void>;
    /**
     * / Browse all profiles — public browsing, no auth required
     */
    getAllProfiles(): Promise<Array<[Principal, UserProfile]>>;
    /**
     * / Get the average rating for a user — public, no auth required
     */
    getAverageRating(user: Principal): Promise<number | null>;
    /**
     * / Required by frontend: get the caller's own profile
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Get messages with another user — requires #user role AND caller must be a participant
     */
    getMessages(withUser: Principal): Promise<Array<Message>>;
    /**
     * / Get exchange requests addressed to the caller — requires #user role
     */
    getMyExchangeRequests(): Promise<Array<ExchangeRequest>>;
    /**
     * / Alias kept for backward compatibility — public browsing, no auth required
     */
    getProfile(user: Principal): Promise<UserProfile | null>;
    /**
     * / Fetch any user's profile — public browsing, no auth required
     */
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    /**
     * / Get all ratings received by a user — public, no auth required
     */
    getUserRatings(user: Principal): Promise<Array<Rating>>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Leave a rating for another user — requires #user role
     */
    leaveRating(toUser: Principal, rating: bigint, review: string): Promise<void>;
    /**
     * / Required by frontend: save the caller's own profile
     */
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Search offered skills by name or category — public, no auth required
     */
    searchSkills(searchTerm: string): Promise<Array<Skill>>;
    /**
     * / Send an exchange request — requires #user role
     */
    sendExchangeRequest(toUser: Principal, fromOfferedSkill: string, fromWantedSkill: string): Promise<void>;
    /**
     * / Send a message — requires #user role AND an accepted match between caller and toUser
     */
    sendMessage(toUser: Principal, content: string): Promise<void>;
}
