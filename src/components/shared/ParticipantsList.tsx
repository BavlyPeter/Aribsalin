import { Search, User, Coins } from 'lucide-react';
import { useState } from 'react';

interface Participant {
  id: string;
  name: string;
  points: number;
  attended: boolean;
  onClick?: () => void;
}

interface ParticipantsListProps {
  participants: Participant[];
}

export function ParticipantsList({ participants }: ParticipantsListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mt-8">
      <div className="mb-4">
        <h3 className="mb-3 text-primary">قائمة المشاركين</h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المشارك أو الرقم..."
            className="w-full pr-11 pl-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filteredParticipants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>لا توجد نتائج</p>
          </div>
        ) : (
          filteredParticipants.map(participant => (
            <button
              key={participant.id}
              onClick={participant.onClick}
              className="w-full bg-card rounded-lg p-4 border border-border shadow-sm active:scale-[0.98] transition-transform text-right"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    participant.attended ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <User className={`w-5 h-5 ${
                      participant.attended ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">{participant.name}</span>
                      {participant.attended && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{participant.id}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1.5 rounded-lg">
                  <Coins className="w-4 h-4" style={{ color: 'var(--secondary)' }} />
                  <span className="font-medium" style={{ color: 'var(--secondary)' }}>
                    {participant.points}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
