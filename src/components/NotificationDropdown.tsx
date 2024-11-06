'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  getDoc 
} from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  from: string;
  fromUser?: {
    name: string;
    photoUrl?: string;
  };
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('to', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const notifs = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          const fromUserRef = doc(db, 'users', data.from);
          const fromUserDoc = await getDoc(fromUserRef);
          const fromUserData = fromUserDoc.data();
          
          return {
            id: docSnapshot.id,
            type: data.type,
            from: data.from,
            status: data.status,
            fromUser: {
              name: fromUserData?.name,
              photoUrl: fromUserData?.photoUrl
            },
            timestamp: data.timestamp.toDate()
          };
        })
      );

      setNotifications(notifs);
      setUnreadCount(notifs.length);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAcceptFollow = async (notification: Notification) => {
    try {
      // Update notification status
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: 'accepted'
      });

      // Add follower to user's followers list
      await updateDoc(doc(db, 'users', user!.uid), {
        followers: arrayUnion(notification.from)
      });

      // Update notifications state
      setNotifications(prev => 
        prev.filter(n => n.id !== notification.id)
      );
    } catch (error) {
      console.error('Error accepting follow request:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.length === 0 ? (
          <DropdownMenuItem>No new notifications</DropdownMenuItem>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-2">
                <span>{notification.fromUser?.name} wants to follow you</span>
              </div>
              <Button onClick={() => handleAcceptFollow(notification)} size="sm">
                Accept
              </Button>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown; 