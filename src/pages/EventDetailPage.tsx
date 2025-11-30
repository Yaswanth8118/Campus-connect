import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  MessageSquare 
} from 'lucide-react';
import { useEventStore } from '../store/eventStore';
import { useRoomStore } from '../store/roomStore';
import { useMessageStore } from '../store/messageStore';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import { Event, Room } from '../types';
import { formatDate, formatTime } from '../lib/utils';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, fetchEvents } = useEventStore();
  const { rooms } = useRoomStore();
  const { messages, sendMessage } = useMessageStore();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [eventRoom, setEventRoom] = useState<Room | null>(null);
  
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  useEffect(() => {
    const foundEvent = events.find(e => e.id === id);
    setEvent(foundEvent || null);
    
    if (foundEvent) {
      const room = rooms.find(r => r.id === foundEvent.roomId);
      setEventRoom(room || null);
    }
  }, [id, events, rooms]);
  
  // Check if user can participate in this event
  const canParticipate = eventRoom?.members.includes(user?.id || '') || false;
  
  // Check if user can manage this event
  const canManageEvent = user?.role === 'admin' || 
                         user?.role === 'coordinator' || 
                         (user?.role === 'faculty' && event?.createdBy === user.id);
  
  // Check if user can post to the event chat
  const canPostMessages = canParticipate && 
                         (user?.role !== 'candidate' || !event?.isLive);
  
  const handleSendMessage = (content: string, type: 'text' | 'image' | 'video', mediaUrl?: string) => {
    if (!user || !event) return;
    
    sendMessage({
      content,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      roomId: event.roomId,
      eventId: event.id,
      type,
      mediaUrl
    });
  };
  
  if (!event) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-800 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft size={18} />}
            className="mr-4"
          />
          <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
          {event.isLive && (
            <Badge variant="danger" className="ml-4 animate-pulse">Live Now</Badge>
          )}
        </div>
        
        <p className="text-gray-600 mb-4">{event.description}</p>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center text-gray-600">
            <Calendar size={16} className="mr-2" />
            <span>{formatDate(event.startTime)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock size={16} className="mr-2" />
            <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
          </div>
          {eventRoom && (
            <div className="flex items-center text-gray-600">
              <MessageSquare size={16} className="mr-2" />
              <span>Room: {eventRoom.name}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Content/Chat */}
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-280px)] flex flex-col">
            <CardHeader className="py-3 px-4 font-medium text-gray-800 bg-gray-50 flex justify-between items-center">
              <span>Event Discussion</span>
              {canManageEvent && event.isLive && (
                <Button 
                  variant="danger" 
                  size="sm"
                >
                  End Event
                </Button>
              )}
            </CardHeader>
            
            {canParticipate ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.length > 0 ? (
                    messages.map(message => (
                      <ChatMessage key={message.id} message={message} />
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No messages yet in this event.</p>
                    </div>
                  )}
                </div>
                
                {/* Chat Input */}
                <ChatInput 
                  roomId={event.roomId} 
                  onSendMessage={handleSendMessage}
                  disabled={!canPostMessages}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <p className="text-gray-600 mb-4">
                    You're not a member of the room associated with this event.
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
          {/* Event Details */}
          <Card>
            <CardHeader className="flex items-center">
              <Calendar size={18} className="mr-2 text-blue-800" />
              <h3 className="font-medium">Event Details</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p className="font-medium">
                    {event.isLive ? (
                      <span className="text-red-600">Live Now</span>
                    ) : (
                      <span className="text-blue-600">Upcoming</span>
                    )}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date</h4>
                  <p>{formatDate(event.startTime)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Time</h4>
                  <p>{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Room</h4>
                  <p>{eventRoom?.name || 'Unknown'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Created By</h4>
                  <p>Faculty Member</p>
                </div>
              </div>
            </CardBody>
          </Card>
          
          {/* Participants */}
          <Card>
            <CardHeader className="flex items-center">
              <Users size={18} className="mr-2 text-blue-800" />
              <h3 className="font-medium">Participants</h3>
            </CardHeader>
            <CardBody className="p-0">
              <div className="py-8 text-center">
                <p className="text-gray-500">
                  {eventRoom ? 
                    `${eventRoom.members.length} members from ${eventRoom.name}` : 
                    'No participants yet'}
                </p>
              </div>
            </CardBody>
          </Card>
          
          {/* Actions */}
          {canManageEvent && (
            <Card>
              <CardHeader>
                <h3 className="font-medium">Event Management</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <Button 
                  variant={event.isLive ? "danger" : "primary"} 
                  fullWidth
                >
                  {event.isLive ? "End Event" : "Start Event"}
                </Button>
                <Button 
                  variant="outline" 
                  fullWidth
                >
                  Edit Event
                </Button>
                <Button 
                  variant="ghost" 
                  fullWidth
                >
                  Cancel Event
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;