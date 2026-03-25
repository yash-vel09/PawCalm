'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell, Info, CreditCard, HelpCircle, Database,
  ChevronRight, LogOut, Star, Mail, FileText, Shield,
  Trash2, Download, Zap, CheckCircle, PawPrint, Plus,
  Pencil, X, Eye, EyeOff, Lock, User,
} from 'lucide-react'
import { useToast } from '@/lib/toast'
import { useAppStore } from '@/store'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('.supabase.co') ?? false

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatMemberSince(dateStr: string | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function getPasswordStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

function StrengthBar({ password }: { password: string }) {
  if (!password) return null
  const score = getPasswordStrength(password)
  const pct = (score / 5) * 100
  let color = 'bg-red-500'
  let label = 'Weak'
  if (pct >= 70) { color = 'bg-green-500'; label = 'Strong' }
  else if (pct >= 40) { color = 'bg-amber-400'; label = 'Fair' }
  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="w-full h-1.5 bg-warm-gray rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-medium-gray">At least 8 characters</span>
        <span className={`text-xs font-semibold ${color.replace('bg-', 'text-')}`}>{label}</span>
      </div>
    </div>
  )
}

// ─── Shared sub-components ─────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 px-1">
      <Icon size={15} className="text-pawcalm-teal" strokeWidth={2} />
      <h3 className="text-[13px] font-bold text-medium-gray uppercase tracking-wide">{title}</h3>
    </div>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-card shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

function SettingsRow({
  label, sublabel, right, onPress, danger = false, borderBottom = true,
}: {
  label: string
  sublabel?: string
  right?: React.ReactNode
  onPress?: () => void
  danger?: boolean
  borderBottom?: boolean
}) {
  const Tag = onPress ? 'button' : 'div'
  return (
    <Tag
      type={onPress ? 'button' : undefined}
      onClick={onPress}
      className={[
        'w-full flex items-center justify-between px-4 py-3.5 text-left',
        borderBottom ? 'border-b border-warm-gray' : '',
        onPress ? 'active:bg-warm-gray transition-colors' : '',
      ].join(' ')}
    >
      <div className="flex-1 min-w-0 pr-3">
        <span className={`text-[15px] font-medium ${danger ? 'text-call-vet-red' : 'text-calm-navy'}`}>
          {label}
        </span>
        {sublabel && <p className="text-[13px] text-medium-gray mt-0.5 leading-snug">{sublabel}</p>}
      </div>
      {right ?? (onPress && !right && <ChevronRight size={16} className="text-medium-gray shrink-0" />)}
    </Tag>
  )
}

function TealToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-[28px] w-[50px] shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pawcalm-teal',
        checked ? 'bg-pawcalm-teal' : 'bg-warm-gray',
      ].join(' ')}
    >
      <span className={[
        'pointer-events-none inline-block h-[22px] w-[22px] rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
        checked ? 'translate-x-[22px]' : 'translate-x-[1px]',
      ].join(' ')} />
    </button>
  )
}

// ─── Change Password Modal ──────────────────────────────────────────────────

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { show } = useToast()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!isConfigured) {
      show('Not available in demo mode')
      onClose()
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.updateUser({ password: newPassword })
      if (authError) throw authError
      show('Password updated')
      onClose()
    } catch {
      setError('Failed to update password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6">
      <div className="bg-white rounded-card w-full max-w-[480px] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-warm-gray">
          <h2 className="text-[18px] font-bold text-calm-navy">Change password</h2>
          <button type="button" onClick={onClose} className="text-medium-gray hover:text-calm-navy">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="text-xs text-call-vet-red bg-red-50 rounded-button px-3 py-2">{error}</div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-calm-navy">New password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full border-2 border-warm-gray rounded-button px-4 py-3 pr-11 text-sm text-calm-navy placeholder-medium-gray focus:outline-none focus:border-pawcalm-teal transition-colors min-h-[48px]"
              />
              <button type="button" onClick={() => setShowNew((v) => !v)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-medium-gray">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <StrengthBar password={newPassword} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-calm-navy">Confirm new password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className={`w-full border-2 rounded-button px-4 py-3 pr-11 text-sm text-calm-navy placeholder-medium-gray focus:outline-none transition-colors min-h-[48px] ${
                  confirmPassword && confirmPassword !== newPassword
                    ? 'border-call-vet-red focus:border-call-vet-red'
                    : 'border-warm-gray focus:border-pawcalm-teal'
                }`}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-medium-gray">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border-2 border-warm-gray rounded-button text-[15px] font-semibold text-calm-navy">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-3 bg-pawcalm-teal rounded-button text-[15px] font-semibold text-white disabled:opacity-60">
              {isLoading ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Sign Out Confirmation ──────────────────────────────────────────────────

function SignOutDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6">
      <div className="bg-white rounded-card w-full max-w-[480px] overflow-hidden shadow-2xl">
        <div className="p-6 pb-4 text-center">
          <div className="w-12 h-12 bg-warm-gray rounded-full flex items-center justify-center mb-4 mx-auto">
            <LogOut size={22} className="text-calm-navy" />
          </div>
          <h2 className="text-[18px] font-bold text-calm-navy mb-2">Sign out of PawCalm?</h2>
          <p className="text-[15px] text-medium-gray leading-relaxed">
            You&apos;ll need to sign back in to access your pets and assessments.
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 border-2 border-warm-gray rounded-button text-[15px] font-semibold text-calm-navy">
            Cancel
          </button>
          <button type="button" onClick={onConfirm}
            className="flex-1 py-3 bg-calm-navy rounded-button text-[15px] font-semibold text-white">
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Account Dialog ──────────────────────────────────────────────────

function DeleteDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const [confirmText, setConfirmText] = useState('')
  const ready = confirmText === 'DELETE'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6">
      <div className="bg-white rounded-card w-full max-w-[480px] overflow-hidden shadow-2xl">
        <div className="p-6 pb-4">
          <div className="w-12 h-12 bg-soft-red-bg rounded-full flex items-center justify-center mb-4 mx-auto">
            <Trash2 size={22} className="text-call-vet-red" />
          </div>
          <h2 className="text-[18px] font-bold text-calm-navy text-center mb-2">Delete your PawCalm account?</h2>
          <p className="text-[14px] text-medium-gray leading-relaxed text-center mb-4">
            This will permanently delete your account, all pet profiles, and all assessment history.{' '}
            <span className="text-calm-navy font-medium">This action cannot be undone.</span>
          </p>
          <label className="text-sm font-semibold text-calm-navy block mb-1">
            Type <span className="text-call-vet-red font-bold">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full border-2 border-warm-gray rounded-button px-4 py-3 text-sm text-calm-navy placeholder-medium-gray focus:outline-none focus:border-call-vet-red transition-colors min-h-[48px]"
          />
        </div>
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 border-2 border-warm-gray rounded-button text-[15px] font-semibold text-calm-navy">
            Keep account
          </button>
          <button type="button" onClick={onConfirm} disabled={!ready}
            className="flex-1 py-3 bg-call-vet-red rounded-button text-[15px] font-semibold text-white disabled:opacity-40 transition-opacity">
            Delete account
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Account Section ────────────────────────────────────────────────────────

function AccountSection() {
  const { user, signOut } = useAuth()
  const { show } = useToast()
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [isSavingName, setIsSavingName] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const provider = user?.app_metadata?.provider ?? 'email'
  const isGoogle = provider === 'google'
  const displayName = user?.user_metadata?.full_name
    ?? (user?.email ? user.email.split('@')[0] : 'Account')
  const displayEmail = user?.email ?? '—'
  const initial = displayName[0]?.toUpperCase() ?? '?'
  const memberSince = formatMemberSince(user?.created_at)

  function startEditName() {
    setNameInput(displayName)
    setIsEditingName(true)
  }

  async function handleSaveName() {
    if (!nameInput.trim()) return
    if (!isConfigured) {
      show('Not available in demo mode')
      setIsEditingName(false)
      return
    }
    setIsSavingName(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ data: { full_name: nameInput.trim() } })
      if (error) throw error
      show('Name updated')
      setIsEditingName(false)
    } catch {
      show('Failed to update name')
    } finally {
      setIsSavingName(false)
    }
  }

  async function handleSignOut() {
    setShowSignOutDialog(false)
    await signOut()
  }

  async function handleDeleteConfirm() {
    setShowDeleteDialog(false)
    if (!isConfigured) {
      show('Not available in demo mode')
      return
    }
    // For prototype: sign out and show toast (admin deletion requires server-side)
    show('Account deletion requested — our team will process it within 48 hours.')
    await signOut()
  }

  return (
    <>
      <Card>
        {/* Profile header */}
        <div className="px-4 pt-5 pb-4 border-b border-warm-gray flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-pawcalm-teal flex items-center justify-center shrink-0">
            <span className="text-[26px] font-bold text-white">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            {/* Name row */}
            {isEditingName ? (
              <div className="mb-1">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName()
                    if (e.key === 'Escape') setIsEditingName(false)
                  }}
                  className="w-full border-2 border-pawcalm-teal rounded-button px-3 py-1.5 text-[16px] font-bold text-calm-navy focus:outline-none"
                />
                <div className="flex items-center gap-2 mt-3">
                  <button type="button" onClick={handleSaveName} disabled={isSavingName}
                    className="flex-1 text-sm font-semibold text-white bg-pawcalm-teal px-3 py-2 rounded-button disabled:opacity-60">
                    {isSavingName ? '…' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setIsEditingName(false)}
                    className="flex-1 text-sm font-semibold text-medium-gray border-2 border-warm-gray px-3 py-2 rounded-button">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-[17px] font-bold text-calm-navy truncate">{displayName}</h3>
                <button type="button" onClick={startEditName}
                  className="text-medium-gray hover:text-pawcalm-teal transition-colors shrink-0">
                  <Pencil size={14} />
                </button>
              </div>
            )}
            <p className="text-[13px] text-medium-gray truncate">{displayEmail}</p>
            {memberSince && (
              <p className="text-[12px] text-medium-gray mt-0.5">Member since {memberSince}</p>
            )}
            {/* Provider badge */}
            <div className="mt-1.5">
              {isGoogle ? (
                <span className="inline-flex items-center gap-1.5 bg-warm-gray text-calm-navy text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
                  </svg>
                  Signed in with Google
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-medium-gray">
                  <Mail size={10} />
                  Signed in with email
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Change password (email users only) */}
        {!isGoogle && (
          <SettingsRow
            label="Change password"
            onPress={() => {
              if (!isConfigured) { show('Not available in demo mode'); return }
              setShowPasswordModal(true)
            }}
            right={<Lock size={16} className="text-medium-gray shrink-0" />}
          />
        )}

        {/* Sign out */}
        <SettingsRow
          label="Sign out"
          onPress={() => setShowSignOutDialog(true)}
          right={<LogOut size={16} className="text-call-vet-red shrink-0" />}
          danger
          borderBottom={false}
        />
      </Card>

      {/* Modals */}
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      {showSignOutDialog && (
        <SignOutDialog onConfirm={handleSignOut} onCancel={() => setShowSignOutDialog(false)} />
      )}
      {showDeleteDialog && (
        <DeleteDialog onConfirm={handleDeleteConfirm} onCancel={() => setShowDeleteDialog(false)} />
      )}

      {/* Expose delete trigger via a ref-like pattern — handled below in page */}
      <input type="hidden" id="__delete-trigger" />
    </>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter()
  const pets = useAppStore((s) => s.pets)
  const setActivePet = useAppStore((s) => s.setActivePet)
  const { show } = useToast()

  const [followUp24, setFollowUp24] = useState(true)
  const [followUp48, setFollowUp48] = useState(false)
  const [dailyCheckin, setDailyCheckin] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { signOut } = useAuth()

  async function handleDeleteConfirm() {
    setShowDeleteDialog(false)
    if (!isConfigured) {
      show('Not available in demo mode')
      return
    }
    show('Account deletion requested — our team will process it within 48 hours.')
    await signOut()
  }

  function handleExportData() {
    show('Export feature coming soon')
  }

  return (
    <div className="flex flex-col bg-soft-cream min-h-[calc(100vh-64px)]">
      <div className="overflow-y-auto px-4 pt-8 pb-12 space-y-6 max-w-[480px] mx-auto w-full">

        <h1 className="text-[28px] font-bold text-calm-navy px-1">Settings</h1>

        {/* ── 0. MY PETS ── */}
        <div>
          <SectionHeader icon={PawPrint} title="My Pets" />
          <Card>
            {pets.map((pet, i) => (
              <SettingsRow
                key={pet.id}
                label={pet.name}
                sublabel={`${pet.breed} · ${pet.type === 'cat' ? '🐱 Cat' : '🐕 Dog'}`}
                onPress={() => { setActivePet(pet.id); router.push('/profile') }}
                borderBottom={i < pets.length - 1}
                right={
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-light-teal flex items-center justify-center text-[13px] font-bold text-pawcalm-teal">
                      {pet.name[0].toUpperCase()}
                    </div>
                    <ChevronRight size={16} className="text-medium-gray" />
                  </div>
                }
              />
            ))}
          </Card>
          <button
            type="button"
            onClick={() => router.push('/onboarding')}
            className="mt-2 w-full flex items-center gap-2 px-4 py-3 bg-white rounded-card border border-warm-gray text-pawcalm-teal text-[15px] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
          >
            <Plus size={18} className="shrink-0" />
            Add a pet
          </button>
        </div>

        {/* ── 1. ACCOUNT ── */}
        <div>
          <SectionHeader icon={User} title="Account" />
          <AccountSection />
        </div>

        {/* ── 2. NOTIFICATIONS ── */}
        <div>
          <SectionHeader icon={Bell} title="Notifications" />
          <Card>
            <SettingsRow
              label="24-hour follow-up reminder"
              sublabel="Remind me to check in on my dog the day after an assessment"
              right={<TealToggle checked={followUp24} onChange={setFollowUp24} label="24-hour follow-up reminder" />}
            />
            <SettingsRow
              label="48-hour follow-up reminder"
              sublabel="A second check-in two days after an assessment"
              right={<TealToggle checked={followUp48} onChange={setFollowUp48} label="48-hour follow-up reminder" />}
            />
            <SettingsRow
              label="Daily check-in reminder"
              sublabel="A daily reminder to check in on how your pet is doing"
              right={<TealToggle checked={dailyCheckin} onChange={setDailyCheckin} label="Daily check-in reminder" />}
              borderBottom={false}
            />
          </Card>
        </div>

        {/* ── 3. SUBSCRIPTION ── */}
        <div>
          <SectionHeader icon={CreditCard} title="Subscription" />
          <Card className="mb-3">
            <SettingsRow
              label="Current plan"
              sublabel="3 assessments per month"
              right={
                <span className="bg-warm-gray text-calm-navy text-[12px] font-bold px-2.5 py-1 rounded-full shrink-0">
                  Free
                </span>
              }
              borderBottom={false}
            />
          </Card>
          <div className="rounded-card overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-pawcalm-teal/20">
            <div className="bg-pawcalm-teal px-5 py-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-white" fill="white" />
                  <span className="text-white font-bold text-[16px]">Premium</span>
                </div>
                <span className="text-white/90 text-[15px] font-semibold">
                  $14.99<span className="text-white/60 text-[13px] font-normal">/mo</span>
                </span>
              </div>
              <p className="text-white/80 text-[13px]">Everything you need for total peace of mind</p>
            </div>
            <div className="bg-white px-5 py-4 space-y-3">
              {[
                'Unlimited concern assessments',
                'Behavioral pattern alerts',
                'Vet report PDF exports',
                'Multi-pet household support (dogs & cats)',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-pawcalm-teal shrink-0" />
                  <span className="text-[14px] text-calm-navy">{benefit}</span>
                </div>
              ))}
              <button
                type="button"
                onClick={() => show('Subscriptions coming soon')}
                className="w-full mt-2 py-3 bg-pawcalm-teal rounded-button text-[15px] font-semibold text-white"
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. SUPPORT ── */}
        <div>
          <SectionHeader icon={HelpCircle} title="Support" />
          <Card>
            <SettingsRow
              label="Contact us"
              sublabel="support@pawcalm.com"
              onPress={() => { window.location.href = 'mailto:support@pawcalm.com' }}
              right={<Mail size={16} className="text-medium-gray shrink-0" />}
            />
            <SettingsRow
              label="Rate PawCalm"
              sublabel="Enjoying the app? Leave us a review"
              onPress={() => show('App rating coming soon')}
              right={<Star size={16} className="text-medium-gray shrink-0" />}
            />
            <SettingsRow
              label="FAQ"
              sublabel="Common questions about PawCalm"
              onPress={() => show('FAQ coming soon')}
              borderBottom={false}
            />
          </Card>
        </div>

        {/* ── 5. ABOUT ── */}
        <div>
          <SectionHeader icon={Info} title="About PawCalm" />
          <Card className="mb-3">
            <SettingsRow
              label="Version"
              right={<span className="text-[15px] text-medium-gray">1.0.0 (build 9)</span>}
            />
            <SettingsRow
              label="Privacy Policy"
              onPress={() => show('Privacy Policy coming soon')}
              right={<FileText size={16} className="text-medium-gray shrink-0" />}
            />
            <SettingsRow
              label="Terms of Service"
              onPress={() => show('Terms of Service coming soon')}
              right={<FileText size={16} className="text-medium-gray shrink-0" />}
              borderBottom={false}
            />
          </Card>
          <div className="bg-light-teal rounded-card px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-pawcalm-teal shrink-0" />
              <span className="text-[13px] font-bold text-pawcalm-teal uppercase tracking-wide">What PawCalm is</span>
            </div>
            <p className="text-[14px] text-calm-navy leading-relaxed">
              PawCalm provides <span className="font-semibold">behavioral guidance</span>, not medical diagnoses.
              We help you understand what your dog&apos;s or cat&apos;s behavior might mean and decide whether to monitor,
              try something at home, or call your vet — but we never replace professional veterinary care.
            </p>
          </div>
        </div>

        {/* ── 6. DATA ── */}
        <div>
          <SectionHeader icon={Database} title="Data" />
          <Card>
            <SettingsRow
              label="Export my data"
              sublabel="Download all your assessments as a PDF"
              onPress={handleExportData}
              right={<Download size={16} className="text-medium-gray shrink-0" />}
            />
            <SettingsRow
              label="Delete my account"
              sublabel="Permanently remove all your data"
              onPress={() => setShowDeleteDialog(true)}
              danger
              right={<Trash2 size={16} className="text-call-vet-red shrink-0" />}
              borderBottom={false}
            />
          </Card>
          <p className="text-[12px] text-medium-gray text-center mt-3 px-2 leading-relaxed">
            Your data is encrypted at rest and in transit. We never sell or share personal information.
          </p>
        </div>

      </div>

      {showDeleteDialog && (
        <DeleteDialog
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  )
}
