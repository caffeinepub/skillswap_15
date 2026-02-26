import React, { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Skill } from '../backend';
import { Edit2, Save, X, Plus, Sparkles, BookOpen, User } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  'Technology', 'Design', 'Business', 'Language', 'Music',
  'Art', 'Cooking', 'Fitness', 'Science', 'Writing', 'Other'
];

interface SkillForm {
  name: string;
  category: string;
  description: string;
  proficiency: number;
}

const toSkillForm = (s: Skill): SkillForm => ({
  name: s.name,
  category: s.category,
  description: s.description,
  proficiency: Number(s.proficiency),
});

const toSkill = (s: SkillForm): Skill => ({
  name: s.name.trim(),
  category: s.category,
  description: s.description.trim(),
  proficiency: BigInt(s.proficiency),
});

const emptySkill = (): SkillForm => ({
  name: '',
  category: 'Technology',
  description: '',
  proficiency: 3,
});

const proficiencyLabel = (p: number) => {
  if (p >= 5) return 'Expert';
  if (p >= 4) return 'Advanced';
  if (p >= 3) return 'Intermediate';
  if (p >= 2) return 'Beginner';
  return 'Novice';
};

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [offeredSkills, setOfferedSkills] = useState<SkillForm[]>([]);
  const [wantedSkills, setWantedSkills] = useState<SkillForm[]>([]);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setBio(profile.bio);
      setOfferedSkills(profile.offeredSkills.map(toSkillForm));
      setWantedSkills(profile.wantedSkills.map(toSkillForm));
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    const validOffered = offeredSkills.filter((s) => s.name.trim());
    const validWanted = wantedSkills.filter((s) => s.name.trim());
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        bio: bio.trim(),
        offeredSkills: validOffered.map(toSkill),
        wantedSkills: validWanted.map(toSkill),
      });
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save profile');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setName(profile.name);
      setBio(profile.bio);
      setOfferedSkills(profile.offeredSkills.map(toSkillForm));
      setWantedSkills(profile.wantedSkills.map(toSkillForm));
    }
    setEditing(false);
  };

  const updateSkill = (
    list: SkillForm[],
    setList: React.Dispatch<React.SetStateAction<SkillForm[]>>,
    index: number,
    field: keyof SkillForm,
    value: string | number
  ) => {
    const updated = [...list];
    updated[index] = { ...updated[index], [field]: value };
    setList(updated);
  };

  const removeSkill = (
    list: SkillForm[],
    setList: React.Dispatch<React.SetStateAction<SkillForm[]>>,
    index: number
  ) => {
    setList(list.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-3xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-3xl text-center">
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">My Profile</h1>
        {!editing ? (
          <Button
            onClick={() => setEditing(true)}
            variant="outline"
            className="gap-2 border-border hover:bg-accent/50"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveProfile.isPending}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {saveProfile.isPending ? (
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Basic Info Card */}
      <Card className="shadow-card border-border">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-display font-bold text-2xl">
                {(editing ? name : profile.name).charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="edit-name">Name *</Label>
                    <Input
                      id="edit-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-bio">Bio</Label>
                    <Textarea
                      id="edit-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="mt-1 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-2xl font-semibold text-foreground">{profile.name}</h2>
                  {profile.bio && (
                    <p className="text-muted-foreground mt-1 leading-relaxed">{profile.bio}</p>
                  )}
                  {identity && (
                    <p className="text-xs text-muted-foreground/60 mt-2 font-mono truncate">
                      {identity.getPrincipal().toString()}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offered Skills */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Skills I Can Teach
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {editing ? (
            <div className="space-y-3">
              {offeredSkills.map((skill, idx) => (
                <SkillEditRow
                  key={idx}
                  skill={skill}
                  index={idx}
                  onUpdate={(field, value) => updateSkill(offeredSkills, setOfferedSkills, idx, field, value)}
                  onRemove={() => removeSkill(offeredSkills, setOfferedSkills, idx)}
                  showProficiency
                />
              ))}
              <button
                onClick={() => setOfferedSkills((prev) => [...prev, emptySkill()])}
                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add skill
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {profile.offeredSkills.length === 0 ? (
                <p className="text-muted-foreground text-sm">No skills added yet.</p>
              ) : (
                profile.offeredSkills.map((skill) => (
                  <SkillDisplayRow key={skill.name} skill={skill} type="offered" />
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wanted Skills */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-secondary" />
            Skills I Want to Learn
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {editing ? (
            <div className="space-y-3">
              {wantedSkills.map((skill, idx) => (
                <SkillEditRow
                  key={idx}
                  skill={skill}
                  index={idx}
                  onUpdate={(field, value) => updateSkill(wantedSkills, setWantedSkills, idx, field, value)}
                  onRemove={() => removeSkill(wantedSkills, setWantedSkills, idx)}
                  showProficiency={false}
                />
              ))}
              <button
                onClick={() => setWantedSkills((prev) => [...prev, emptySkill()])}
                className="flex items-center gap-1.5 text-sm text-secondary hover:text-secondary/80 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add skill
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {profile.wantedSkills.length === 0 ? (
                <p className="text-muted-foreground text-sm">No skills added yet.</p>
              ) : (
                profile.wantedSkills.map((skill) => (
                  <SkillDisplayRow key={skill.name} skill={skill} type="wanted" />
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SkillDisplayRow({ skill, type }: { skill: Skill; type: 'offered' | 'wanted' }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${type === 'offered' ? 'bg-primary' : 'bg-secondary'}`} />
        <div>
          <span className="font-medium text-sm text-foreground">{skill.name}</span>
          {skill.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{skill.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant="outline" className="text-xs border-border">
          {skill.category}
        </Badge>
        {type === 'offered' && (
          <span className="text-xs text-muted-foreground">
            {['', 'Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'][Number(skill.proficiency)] ?? ''}
          </span>
        )}
      </div>
    </div>
  );
}

interface SkillEditRowProps {
  skill: SkillForm;
  index: number;
  onUpdate: (field: keyof SkillForm, value: string | number) => void;
  onRemove: () => void;
  showProficiency: boolean;
}

function SkillEditRow({ skill, onUpdate, onRemove, showProficiency }: SkillEditRowProps) {
  return (
    <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 gap-2 flex-1 mr-2">
          <Input
            value={skill.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="Skill name"
            className="h-8 text-sm"
          />
          <Select value={skill.category} onValueChange={(v) => onUpdate('category', v)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <Input
        value={skill.description}
        onChange={(e) => onUpdate('description', e.target.value)}
        placeholder="Brief description"
        className="h-8 text-sm"
      />
      {showProficiency && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Proficiency:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => onUpdate('proficiency', n)}
                className={`w-6 h-6 rounded text-xs font-semibold transition-colors ${
                  skill.proficiency >= n
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
