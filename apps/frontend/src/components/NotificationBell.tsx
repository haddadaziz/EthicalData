"use client";

import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../lib/api';
import { Bell, MessageCircle, Heart, ShieldAlert, CheckCheck, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface NotificationItem {
  id: string;
  titre: string;
  message: string;
  type: string;
  lien?: string | null;
  lue: boolean;
  dateCreation: string;
}

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Erreur chargement notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await apiFetch(`/notifications/${id}/lire`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lue: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiFetch('/notifications/tout-lire', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
      const targetNotif = notifications.find(n => n.id === id);
      if (targetNotif && !targetNotif.lue) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.lue) {
      await handleMarkAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.lien) {
      router.push(notif.lien);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'FORUM_REPLY':
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      case 'FORUM_LIKE':
        return <Heart className="w-4 h-4 text-rose-600 fill-rose-600/20" />;
      case 'FORUM_REPORT':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-amber-600" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return "Hier";
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const displayedNotifications = filter === 'UNREAD'
    ? notifications.filter(n => !n.lue)
    : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton Cloche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-slate-700 hover:text-slate-950 transition-all cursor-pointer shadow-sm flex items-center justify-center"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Menu Déroulant des Notifications */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200/90 rounded-3xl shadow-2xl z-50 overflow-hidden text-left"
          >
            {/* En-tête du menu */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-950 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black rounded-full">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-bold text-slate-500 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Tout marquer comme lu</span>
                </button>
              )}
            </div>

            {/* Onglets Tout / Non lu */}
            <div className="flex border-b border-slate-100 px-4 pt-2 gap-2 text-xs font-bold text-slate-500">
              <button
                onClick={() => setFilter('ALL')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  filter === 'ALL' ? 'border-red-600 text-slate-950 font-black' : 'border-transparent hover:text-slate-700'
                }`}
              >
                Toutes ({notifications.length})
              </button>

              <button
                onClick={() => setFilter('UNREAD')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  filter === 'UNREAD' ? 'border-red-600 text-slate-950 font-black' : 'border-transparent hover:text-slate-700'
                }`}
              >
                Non lues ({unreadCount})
              </button>
            </div>

            {/* Liste des Notifications */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {displayedNotifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium text-xs">
                  Aucune notification {filter === 'UNREAD' ? 'non lue' : ''} pour le moment.
                </div>
              ) : (
                displayedNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 group relative ${
                      !notif.lue ? 'bg-red-50/20' : ''
                    }`}
                  >
                    {/* Icône du type */}
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center justify-center shrink-0 mt-0.5">
                      {getNotifIcon(notif.type)}
                    </div>

                    {/* Contenu textuel */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs truncate ${!notif.lue ? 'font-black text-slate-950' : 'font-bold text-slate-800'}`}>
                          {notif.titre}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold shrink-0">{formatTime(notif.dateCreation)}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 font-medium leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    {/* Action de suppression */}
                    <button
                      onClick={(e) => handleDelete(notif.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Point d'état non lu */}
                    {!notif.lue && (
                      <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 self-center" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
