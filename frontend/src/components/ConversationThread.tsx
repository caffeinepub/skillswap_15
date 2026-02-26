import React, { useState, useRef, useEffect } from 'react';
import { useGetMessages, useSendMessage, useGetUserProfile } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, MessageSquare, Lock } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import type { Message } from '../backend';

interface ConversationThreadProps {
  otherUserPrincipal: string;
}

function MessageBubble({
  message,
  isMine,
  senderName,
}: {
  message: Message;
  isMine: boolean;
  senderName: string;
}) {
  const date = new Date(Number(message.timestamp) / 1_000_000);
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] space-y-1 flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        <span className="text-xs text-muted-foreground px-1">{isMine ? 'You' : senderName}</span>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMine
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-card border border-border text-foreground rounded-bl-sm shadow-xs'
          }`}
        >
          {message.content}
        </div>
        <span className="text-xs text-muted-foreground/60 px-1">{timeStr}</span>
      </div>
    </div>
  );
}

export default function ConversationThread({ otherUserPrincipal }: ConversationThreadProps) {
  const { identity } = useInternetIdentity();
  const { data: messages, isLoading, error } = useGetMessages(otherUserPrincipal);
  const { data: otherProfile } = useGetUserProfile(otherUserPrincipal);
  const { data: myProfile } = useGetCallerUserProfile();
  const sendMessage = useSendMessage();
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const myPrincipal = identity?.getPrincipal().toString();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!content.trim()) return;
    try {
      const { Principal } = await import('@icp-sdk/core/principal');
      await sendMessage.mutateAsync({
        toUser: Principal.fromText(otherUserPrincipal),
        content: content.trim(),
      });
      setContent('');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to send message');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 max-w-2xl text-center">
        <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">Sign in required</h2>
        <p className="text-muted-foreground text-sm">Please log in to view messages.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-2xl text-center">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">Cannot access conversation</h2>
        <p className="text-muted-foreground text-sm mb-4">
          You can only message users with whom you have an accepted exchange.
        </p>
        <Button variant="outline" onClick={() => navigate({ to: '/dashboard' })}>
          ← Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-2xl flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/dashboard' })}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {otherProfile?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-foreground leading-tight">
              {otherProfile?.name ?? 'Loading...'}
            </h2>
            <p className="text-xs text-muted-foreground">Skill Exchange Partner</p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-hidden rounded-2xl border border-border bg-muted/20 mb-4">
        <ScrollArea className="h-full p-4">
          {isLoading ? (
            <div className="space-y-3 p-2">
              <Skeleton className="h-10 w-48 rounded-2xl" />
              <Skeleton className="h-10 w-56 rounded-2xl ml-auto" />
              <Skeleton className="h-10 w-40 rounded-2xl" />
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm font-medium">No messages yet</p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Start the conversation with {otherProfile?.name ?? 'your exchange partner'}!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  message={msg}
                  isMine={msg.from.toString() === myPrincipal}
                  senderName={otherProfile?.name ?? 'Partner'}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 flex gap-2 items-end">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          className="resize-none rounded-xl min-h-[44px] max-h-32 flex-1"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={sendMessage.isPending || !content.trim()}
          size="icon"
          className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
        >
          {sendMessage.isPending ? (
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
