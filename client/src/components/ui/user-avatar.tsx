import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LogOut,
  User,
  ShoppingBag,
  Heart,
  Settings,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  CustomDropdown,
  CustomDropdownItem,
  CustomDropdownLabel,
  CustomDropdownSeparator,
} from '@/components/ui/custom-dropdown';
import { Link } from 'wouter';

interface UserAvatarProps {
  username: string;
  email?: string;
  imageUrl?: string;
}

export function UserAvatar({ username, email, imageUrl }: UserAvatarProps) {
  const { logout, user } = useAuth();

  const initials = username ? username.charAt(0).toUpperCase() : 'U';

  const handleLogout = () => {
    logout();
  };

  return (
    <CustomDropdown
      align="right"
      trigger={
        <button className="flex items-center border border-gray-200 rounded-md py-1.5 px-2 text-gray-700 hover:bg-gray-50 transition-colors">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={imageUrl} alt={username} />
            <AvatarFallback className="bg-primary text-white">
              {username && username.length > 0
                ? username.charAt(0)
                : email && email.length > 0
                ? email.charAt(0)
                : 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{username}</span>
        </button>
      }
    >
      <CustomDropdownLabel>ჩემი ანგარიში</CustomDropdownLabel>

      <CustomDropdownSeparator />

      <Link href="/profile">
        <CustomDropdownItem icon={<User className="h-4 w-4" />}>
          პროფილი
        </CustomDropdownItem>
      </Link>

      <Link href="/orders">
        <CustomDropdownItem icon={<ShoppingBag className="h-4 w-4" />}>
          ჩემი შეკვეთები
        </CustomDropdownItem>
      </Link>

      <Link href="/profile">
        <CustomDropdownItem icon={<Heart className="h-4 w-4" />}>
          რჩეულები
        </CustomDropdownItem>
      </Link>

      <Link href="/profile">
        <CustomDropdownItem icon={<Settings className="h-4 w-4" />}>
          პარამეტრები
        </CustomDropdownItem>
      </Link>

      {/* Admin menu item - only visible to admin users */}
      {user?.role === 'admin' && (
        <>
          <CustomDropdownSeparator />
          <Link href="/admin">
            <CustomDropdownItem icon={<Shield className="h-4 w-4" />}>
              ადმინისტრატორი
            </CustomDropdownItem>
          </Link>
        </>
      )}

      <CustomDropdownSeparator />

      <CustomDropdownItem
        icon={<LogOut className="h-4 w-4" />}
        onClick={handleLogout}
      >
        გასვლა
      </CustomDropdownItem>
    </CustomDropdown>
  );
}
