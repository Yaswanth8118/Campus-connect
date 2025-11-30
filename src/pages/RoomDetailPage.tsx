import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Calendar } from 'lucide-react';
import { useRoomStore } from '../store/roomStore';
import { useMessageStore } from '../store/messageStore';
import { useAuthStore } from '../store/authStore';
import { useEventStore } from '../store/eventStore';
import Button from '../components/ui/Button';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { Room, Message, Event } from '../types';
import { formatDate } from '../lib/utils';

const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { rooms, fetchRooms } = useRoomStore();
  const { messages, fetchMessages, sendMessage } = useMessageStore();
  const { user } = useAuthStore();
  const { events } = useEventStore();
  const [room, setRoom] = useState<Room | null>(null);
  const [roomEvents, setRoomEvents] = useState<Event[]>([]);
  
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);
  
  useEffect(() => {
    if (id) {
      fetchMessages(id);
    }
  }, [id, fetchMessages]);
  
  useEffect(() => {
    const foundRoom = rooms.find(r => r.id === id);
    setRoom(foundRoom || null);
    
    // Find events associated with this room
    if (foundRoom) {
      const associatedEvents = events.filter(e => e.roomId === foundRoom.id);
      setRoomEvents(associatedEvents);
    }
  }, [id, rooms, events]);
  
  // Check if user is a member of this room
  const isMember = room?.members.includes(user?.id || '') || false;
  
  // Check if user has permission to manage room
  const canManageRoom = user?.role === 'admin' || 
                         user?.role === 'coordinator' || 
                         (user?.role === 'faculty' && room?.createdBy === user.id);
  
  const handleSendMessage = (content: string, type: 'text' | 'image' | 'video', mediaUrl?: string) => {
    if (!user || !room) return;
    
    sendMessage({
      content,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      roomId: room.id,
      type,
      mediaUrl
    });
  };
  
  if (!room) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-800 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft size={18} />}
            className="mr-4"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{room.name}</h1>
            <p className="text-gray-600">{room.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="primary" size="md">
            <Users size={14} className="mr-1" />
            {room.members.length} Members
          </Badge>
          <Badge variant="secondary" size="md">
            Created {formatDate(room.createdAt)}
          </Badge>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Section */}
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-230px)] flex flex-col">
            <CardHeader className="py-3 px-4 font-medium text-gray-800 bg-gray-50">
              Room Chat
            </CardHeader>
            
            {isMember ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.length > 0 ? (
                    messages.map(message => (
                      <ChatMessage key={message.id} message={message} />
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>
                
                {/* Chat Input */}
                <ChatInput 
                  roomId={room.id} 
                  onSendMessage={handleSendMessage}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <p className="text-gray-600 mb-4">
                    You're not a member of this room.
                  </p>
                  <Button
                    disabled
                    size="sm"
                  >
                    Request Access
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Room Events */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center">
                <Calendar size={18} className="mr-2 text-blue-800" />
                <h3 className="font-medium">Room Events</h3>
              </div>
              {canManageRoom && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/events/new', { state: { roomId: room.id } })}
                >
                  Create
                </Button>
              )}
            </CardHeader>
            <CardBody className="p-0">
              {roomEvents.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {roomEvents.map(event => (
                    <div key={event.id} className="p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">{event.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{formatDate(event.startTime)}</p>
                        </div>
                        {event.isLive && <Badge variant="danger">Live</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No events scheduled for this room.</p>
                </div>
              )}
            </CardBody>
          </Card>
          
          {/* Members */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center">
                <Users size={18} className="mr-2 text-blue-800" />
                <h3 className="font-medium">Members</h3>
              </div>
              {canManageRoom && (
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled
                >
                  Manage
                </Button>
              )}
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-gray-100">
                {/* Mock member data - would be fetched from API in production */}
                <div className="p-3 hover:bg-gray-50">
                  <div className="flex items-center">
                    <Avatar size="sm" name="Admin User" />
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">Admin User</p>
                      <Badge variant="danger" size="sm">Admin</Badge>
                    </div>
                  </div>
                </div>
                <div className="p-3 hover:bg-gray-50">
                  <div className="flex items-center">
                    <Avatar size="sm" name="Coordinator User" />
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">Coordinator User</p>
                      <Badge variant="primary" size="sm">Coordinator</Badge>
                    </div>
                  </div>
                </div>
                <div className="p-3 hover:bg-gray-50">
                  <div className="flex items-center">
                    <Avatar size="sm" name="Faculty User" />
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">Faculty User</p>
                      <Badge variant="secondary" size="sm">Faculty</Badge>
                    </div>
                  </div>
                </div>
                <div className="p-3 hover:bg-gray-50">
                  <div className="flex items-center">
                    <Avatar size="sm" name="Student User" />
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">Student User</p>
                      <Badge variant="success" size="sm">Student</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;