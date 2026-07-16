import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@mfe/shared-store';
import { Button, Avatar } from '@mfe/shared-ui';

export default function UserMenu() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (user) {
    return (
      <Link
        to="/profile"
        className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition duration-150"
        title="Profile Settings"
      >
        <Avatar name={user.displayName} src={user.photoURL} />
        <span className="text-sm font-medium hidden sm:inline">{user.displayName}</span>
      </Link>
    );
  }

  return (
    <Button onClick={() => navigate('/login')}>
      <span>🔐</span>
      <span className="hidden sm:inline font-medium text-sm"> Sign In</span>
    </Button>
  );
}
