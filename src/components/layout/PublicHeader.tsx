"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthLevel } from "@/hooks/useAuthLevel";
import UserDropdown from "@/components/header/UserDropdown";

export default function PublicHeader() {
  const { isAuthenticated, isAdmin, loading } = useAuthLevel();

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  className="dark:hidden"
                  src="/images/logo/auth-logo.svg"
                  alt="Vale"
                  width={120}
                  height={40}
                />
                <Image
                  className="hidden dark:block"
                  src="/images/logo/auth-logo.svg"
                  alt="Vale"
                  width={120}
                  height={40}
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="flex items-center space-x-8">
              <Link
                href="/"
                className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
              >
                Missões
              </Link>

              {loading ? (
                <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : isAuthenticated ? (
                <UserDropdown nameOnly />
              ) : (
                <Link
                  href="/signin"
                  className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="flex justify-around items-center h-16">
          {/* Missões */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center space-y-1 text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
            </svg>
            <span className="text-xs font-medium">Início</span>
          </Link>

          {/* Admin (Mobile) */}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex flex-col items-center justify-center space-y-1 text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-medium">Admin</span>
            </Link>
          )}

          {/* Perfil/Login */}
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ) : isAuthenticated ? (
            <Link
              href="/perfil"
              className="flex flex-col items-center justify-center space-y-1 text-brand-600 dark:text-brand-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">Perfil</span>
            </Link>
          ) : (
            <Link
              href="/signin"
              className="flex flex-col items-center justify-center space-y-1 text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs font-medium">Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <Link href="/" className="flex items-center">
              <Image
                className="dark:hidden"
                src="/images/logo/auth-logo.svg"
                alt="Vale"
                width={100}
                height={32}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/auth-logo.svg"
                alt="Vale"
                width={100}
                height={32}
              />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
