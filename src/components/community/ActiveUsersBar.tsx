import React from 'react';
import { User } from 'lucide-react';

interface ActiveUser {
  id: string;
  name: string;
  avatar: string;
  tweetData: any;
}

interface ActiveUsersBarProps {
  users: ActiveUser[];
  onTweetClick: (tweet: any) => void;
}

export const ActiveUsersBar: React.FC<ActiveUsersBarProps> = ({ users, onTweetClick }) => {
  if (!users || users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-3 border-b border-[#2F3336] overflow-x-auto no-scrollbar bg-black">
      <span className="text-[11px] text-[#71767B] font-bold whitespace-nowrap shrink-0">غردوا حديثاً</span>
      <div className="flex -space-x-2 rtl:space-x-reverse">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={(e) => { e.stopPropagation(); onTweetClick(user.tweetData); }}
            className="w-8 h-8 rounded-full border-2 border-black overflow-hidden hover:scale-110 transition-transform shrink-0 bg-[#2F3336]"
            title={user.name}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                <User size={16} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
