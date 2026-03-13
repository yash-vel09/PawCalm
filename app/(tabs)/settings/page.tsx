'use client'

import { useState } from 'react'
import {
  User, Bell, Info, CreditCard, HelpCircle, Database,
  ChevronRight, LogOut, Star, Mail, FileText, Shield,
  Trash2, Download, Zap, CheckCircle,
} from 'lucide-react'

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
  label,
  sublabel,
  right,
  onPress,
  danger = false,
  borderBottom = true,
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
        {sublabel && (
          <p className="text-[13px] text-medium-gray mt-0.5 leading-snug">{sublabel}</p>
        )}
      </div>
      {right ?? (onPress && !right && (
        <ChevronRight size={16} className="text-medium-gray shrink-0" />
      ))}
    </Tag>
  )
}

// ─── Custom teal toggle ────────────────────────────────────────────────────

function TealToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
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
      <span
        className={[
          'pointer-events-none inline-block h-[22px] w-[22px] rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
          checked ? 'translate-x-[22px]' : 'translate-x-[1px]',
        ].join(' ')}
      />
    </button>
  )
}

// ─── Toast ─────────────────────────────────────────────────────────────────

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-24 inset-x-0 flex justify-center pointer-events-none z-50">
      <div className="bg-calm-navy text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg">
        {message}
      </div>
    </div>
  )
}

// ─── Delete confirmation dialog ────────────────────────────────────────────

function DeleteDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6">
      <div className="bg-white rounded-card w-full max-w-[480px] overflow-hidden shadow-2xl">
        <div className="p-6 pb-4">
          <div className="w-12 h-12 bg-soft-red-bg rounded-full flex items-center justify-center mb-4 mx-auto">
            <Trash2 size={22} className="text-call-vet-red" />
          </div>
          <h2 className="text-[18px] font-bold text-calm-navy text-center mb-2">Delete account?</h2>
          <p className="text-[15px] text-medium-gray leading-relaxed text-center">
            This will permanently delete your account, {' '}
            <span className="text-calm-navy font-medium">all assessments</span>, and your dog&apos;s profile.
            This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 border-2 border-warm-gray rounded-button text-[15px] font-semibold text-calm-navy"
          >
            Keep account
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 bg-call-vet-red rounded-button text-[15px] font-semibold text-white"
          >
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  // Notification toggles
  const [followUp24, setFollowUp24]     = useState(true)
  const [followUp48, setFollowUp48]     = useState(false)
  const [dailyCheckin, setDailyCheckin] = useState(false)

  // UI state
  const [toast, setToast]               = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function handleSignOut() {
    showToast('Sign out coming soon')
  }

  function handleExportData() {
    showToast('Export feature coming soon')
  }

  function handleDeleteConfirm() {
    setShowDeleteDialog(false)
    showToast('Account deletion coming soon')
  }

  return (
    <div className="flex flex-col bg-soft-cream min-h-[calc(100vh-64px)]">
      <div className="overflow-y-auto px-4 pt-8 pb-12 space-y-6 max-w-[480px] mx-auto w-full">

        {/* ── Page title ── */}
        <h1 className="text-[28px] font-bold text-calm-navy px-1">Settings</h1>

        {/* ─────────────────────────────────────────────────
            1. ACCOUNT
        ───────────────────────────────────────────────── */}
        <div>
          <SectionHeader icon={User} title="Account" />
          <Card>
            <SettingsRow
              label="Name"
              right={<span className="text-[15px] text-medium-gray">Alex Johnson</span>}
            />
            <SettingsRow
              label="Email"
              right={<span className="text-[13px] text-medium-gray">alex@example.com</span>}
            />
            <SettingsRow
              label="Sign out"
              onPress={handleSignOut}
              right={<LogOut size={16} className="text-medium-gray shrink-0" />}
              borderBottom={false}
            />
          </Card>
        </div>

        {/* ─────────────────────────────────────────────────
            2. NOTIFICATIONS
        ───────────────────────────────────────────────── */}
        <div>
          <SectionHeader icon={Bell} title="Notifications" />
          <Card>
            <SettingsRow
              label="24-hour follow-up reminder"
              sublabel="Remind me to check in on my dog the day after an assessment"
              right={
                <TealToggle
                  checked={followUp24}
                  onChange={setFollowUp24}
                  label="24-hour follow-up reminder"
                />
              }
            />
            <SettingsRow
              label="48-hour follow-up reminder"
              sublabel="A second check-in two days after an assessment"
              right={
                <TealToggle
                  checked={followUp48}
                  onChange={setFollowUp48}
                  label="48-hour follow-up reminder"
                />
              }
            />
            <SettingsRow
              label="Daily check-in reminder"
              sublabel="A gentle nudge to log any concerns each morning"
              right={
                <TealToggle
                  checked={dailyCheckin}
                  onChange={setDailyCheckin}
                  label="Daily check-in reminder"
                />
              }
              borderBottom={false}
            />
          </Card>
        </div>

        {/* ─────────────────────────────────────────────────
            3. SUBSCRIPTION
        ───────────────────────────────────────────────── */}
        <div>
          <SectionHeader icon={CreditCard} title="Subscription" />
          {/* Current plan row */}
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

          {/* Upgrade card */}
          <div className="rounded-card overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-pawcalm-teal/20">
            {/* Header */}
            <div className="bg-pawcalm-teal px-5 py-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-white" fill="white" />
                  <span className="text-white font-bold text-[16px]">Premium</span>
                </div>
                <span className="text-white/90 text-[15px] font-semibold">$14.99<span className="text-white/60 text-[13px] font-normal">/mo</span></span>
              </div>
              <p className="text-white/80 text-[13px]">Everything you need for total peace of mind</p>
            </div>

            {/* Benefits */}
            <div className="bg-white px-5 py-4 space-y-3">
              {[
                'Unlimited concern assessments',
                'Behavioral pattern alerts',
                'Vet report PDF exports',
                'Multi-dog household support',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-pawcalm-teal shrink-0" />
                  <span className="text-[14px] text-calm-navy">{benefit}</span>
                </div>
              ))}

              <button
                type="button"
                onClick={() => showToast('Subscriptions coming soon')}
                className="w-full mt-2 py-3 bg-pawcalm-teal rounded-button text-[15px] font-semibold text-white"
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────
            4. SUPPORT
        ───────────────────────────────────────────────── */}
        <div>
          <SectionHeader icon={HelpCircle} title="Support" />
          <Card>
            <SettingsRow
              label="Contact us"
              sublabel="support@pawcalm.com"
              onPress={() => {
                window.location.href = 'mailto:support@pawcalm.com'
              }}
              right={<Mail size={16} className="text-medium-gray shrink-0" />}
            />
            <SettingsRow
              label="Rate PawCalm"
              sublabel="Enjoying the app? Leave us a review"
              onPress={() => showToast('App rating coming soon')}
              right={<Star size={16} className="text-medium-gray shrink-0" />}
            />
            <SettingsRow
              label="FAQ"
              sublabel="Common questions about PawCalm"
              onPress={() => showToast('FAQ coming soon')}
              borderBottom={false}
            />
          </Card>
        </div>

        {/* ─────────────────────────────────────────────────
            5. ABOUT PAWCALM
        ───────────────────────────────────────────────── */}
        <div>
          <SectionHeader icon={Info} title="About PawCalm" />
          <Card className="mb-3">
            <SettingsRow
              label="Version"
              right={<span className="text-[15px] text-medium-gray">1.0.0 (build 8)</span>}
            />
            <SettingsRow
              label="Privacy Policy"
              onPress={() => showToast('Privacy Policy coming soon')}
              right={<FileText size={16} className="text-medium-gray shrink-0" />}
            />
            <SettingsRow
              label="Terms of Service"
              onPress={() => showToast('Terms of Service coming soon')}
              right={<FileText size={16} className="text-medium-gray shrink-0" />}
              borderBottom={false}
            />
          </Card>

          {/* What PawCalm is */}
          <div className="bg-light-teal rounded-card px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-pawcalm-teal shrink-0" />
              <span className="text-[13px] font-bold text-pawcalm-teal uppercase tracking-wide">What PawCalm is</span>
            </div>
            <p className="text-[14px] text-calm-navy leading-relaxed">
              PawCalm provides <span className="font-semibold">behavioral guidance</span>, not medical diagnoses.
              We help you understand what your dog&apos;s behavior might mean and decide whether to monitor,
              try something at home, or call your vet — but we never replace professional veterinary care.
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────
            6. DATA
        ───────────────────────────────────────────────── */}
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

      {/* ── Delete dialog ── */}
      {showDeleteDialog && (
        <DeleteDialog
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast} />}
    </div>
  )
}
