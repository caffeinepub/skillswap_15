import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Skill, ExchangeRequest, Message, Rating } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// ── Profile Hooks ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!identity && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
    },
  });
}

export function useGetUserProfile(principal: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      const { Principal } = await import('@icp-sdk/core/principal');
      return actor.getUserProfile(Principal.fromText(principal));
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

// ── Skill Search Hooks ───────────────────────────────────────────────────────

export function useGetAllProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[Principal, UserProfile]>>({
    queryKey: ['allProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSearchSkills(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Skill[]>({
    queryKey: ['searchSkills', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchSkills(searchTerm);
    },
    enabled: !!actor && !actorFetching && searchTerm.length > 0,
  });
}

// ── Exchange Request Hooks ───────────────────────────────────────────────────

export function useGetMyExchangeRequests() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<ExchangeRequest[]>({
    queryKey: ['myExchangeRequests', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyExchangeRequests();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useSendExchangeRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      toUser,
      fromOfferedSkill,
      fromWantedSkill,
    }: {
      toUser: Principal;
      fromOfferedSkill: string;
      fromWantedSkill: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendExchangeRequest(toUser, fromOfferedSkill, fromWantedSkill);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myExchangeRequests'] });
    },
  });
}

export function useAcceptExchangeRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fromUser: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptExchangeRequest(fromUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myExchangeRequests'] });
      queryClient.invalidateQueries({ queryKey: ['acceptedMatches'] });
    },
  });
}

// ── Messaging Hooks ──────────────────────────────────────────────────────────

export function useGetMessages(withUserPrincipal: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Message[]>({
    queryKey: ['messages', withUserPrincipal, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !withUserPrincipal) return [];
      const { Principal } = await import('@icp-sdk/core/principal');
      return actor.getMessages(Principal.fromText(withUserPrincipal));
    },
    enabled: !!actor && !actorFetching && !!identity && !!withUserPrincipal,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ toUser, content }: { toUser: Principal; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(toUser, content);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

// ── Rating Hooks ─────────────────────────────────────────────────────────────

export function useGetUserRatings(principal: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Rating[]>({
    queryKey: ['userRatings', principal],
    queryFn: async () => {
      if (!actor || !principal) return [];
      const { Principal } = await import('@icp-sdk/core/principal');
      return actor.getUserRatings(Principal.fromText(principal));
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useGetAverageRating(principal: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number | null>({
    queryKey: ['averageRating', principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      const { Principal } = await import('@icp-sdk/core/principal');
      return actor.getAverageRating(Principal.fromText(principal));
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useLeaveRating() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      toUser,
      rating,
      review,
    }: {
      toUser: Principal;
      rating: bigint;
      review: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.leaveRating(toUser, rating, review);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRatings'] });
      queryClient.invalidateQueries({ queryKey: ['averageRating'] });
    },
  });
}
