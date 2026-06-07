'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Heart } from 'lucide-react'
import { formatBRL, BASE_PRICE_CENTS, WITH_PHOTO_PRICE_CENTS } from '@/constants/pricing'

export function AnnouncementBar() {
  return (
    <motion.aside
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-50 bg-gradient-to-r from-primary via-rose-500 to-primary text-white"
    >
      <Link
        href="/create"
        className="group container flex items-center justify-center gap-2 py-2 text-center text-sm font-medium"
      >
        <Heart className="h-3.5 w-3.5 shrink-0 fill-current" />
        <span className="text-pretty">
          <span aria-hidden className="mr-1">💝</span>
          Dia dos Namorados — de{' '}
          <s className="opacity-70">{formatBRL(WITH_PHOTO_PRICE_CENTS)}</s> por{' '}
          <span className="font-semibold">{formatBRL(BASE_PRICE_CENTS)}</span> · só até dia 8
        </span>
        <span className="hidden items-center gap-1 font-semibold underline-offset-2 group-hover:underline sm:inline-flex">
          Criar agora
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 sm:hidden" />
      </Link>
    </motion.aside>
  )
}
