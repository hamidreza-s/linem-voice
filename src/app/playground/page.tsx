'use client';

import { Theme, Container, Flex, Box, Text, Button, Card, Spinner } from '@radix-ui/themes';
import { useState, useEffect, useRef } from 'react';
import { PhoneOff, PhoneCall } from 'lucide-react';
import Vapi from "@vapi-ai/web";

export default function Playground() {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [vapi] = useState(() => new Vapi("aa08d2ca-16ef-499c-b921-6d130ac39436"));
  const assistantId = "fa4261ff-0490-4da6-bee7-fd8e1ec9b45b";
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setCallDuration(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Set up event listeners
    vapi.on("speech-start", () => {
      console.log("Assistant started speaking");
    });

    vapi.on("speech-end", () => {
      console.log("Assistant finished speaking");
    });

    vapi.on("message", (message) => {
      console.log("Received message:", message);
      
      if (message.type === "transcript" && message.transcriptType === "final") {
        const isUser = message.role === "user";
        setMessages(prev => [...prev, { text: message.transcript, isUser }]);
      } else if (message.type === "assistant-message") {
        console.log("Assistant message:", message);
        setMessages(prev => [...prev, { text: message.text, isUser: false }]);
      }
    });

    vapi.on("error", (error) => {
      console.error("Vapi error:", error);
      setIsConnecting(false);
    });

    return () => {
      vapi.stop();
    };
  }, [vapi]);

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        setIsConnecting(true);
        const call = await vapi.start(assistantId);
        console.log("Call started:", call);
        setIsRecording(true);
        setIsConnecting(false);
      } catch (error) {
        console.error("Failed to start call:", error);
        setIsConnecting(false);
      }
    } else {
      vapi.stop();
      setIsRecording(false);
    }
  };

  return (
    <Theme appearance="dark" accentColor="blue" grayColor="slate" scaling="100%">
      <Container size="2" className="flex flex-col bg-neutral-800 min-h-screen">
        {/* Header */}
        <Box className="sticky top-0 z-10 p-6 bg-neutral-800">
          <Flex justify="between" align="center">
            <Text size="5" weight="bold">
              Grocery Assistant
            </Text>

            {/* Call in progress */}
            {(isRecording || isConnecting) && (
              <Flex align="center" gap="2" className="text-gray-400">
                <Text size="2" weight="medium" className="font-mono">
                  {isConnecting ? (
                    <Spinner/>
                  ) : formatTime(callDuration)}
                </Text>
              </Flex>
            )}

            {/* Voice Input Area */}
            <Box>
              <Flex justify="center" align="center" direction="column" gap="2">
                <Button
                  size="3"
                  variant="solid"
                  color={isRecording || isConnecting ? "red" : "green"}
                  className={`w-16 h-16 rounded-full transition-all duration-200`}
                  onClick={toggleRecording}
                  disabled={isConnecting}
                >
                  {isRecording || isConnecting ? (
                    <PhoneOff className="w-6 h-6 text-white" />
                  ) : (
                    <PhoneCall className="w-6 h-6 text-white" />
                  )}
                </Button>
              </Flex>
            </Box>
          </Flex>
        </Box>

        {/* Messages Area */}
        <Box className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isConnecting && !isRecording && (
            <Text align="center" as="div" className="p-12 text-neutral-500">You can start by calling me!</Text>
          )}
          {messages.map((message, index) => (
            <Card key={index} className={`p-4 max-w-[80%] border-0 ${message.isUser
              ? 'ml-auto bg-green-200'
              : 'mr-auto bg-blue-200'
            }`}>
              <Text className="text-gray-800">
                {message.text}
              </Text>
            </Card>
          ))}
          <div ref={messagesEndRef} />
        </Box>
      </Container>
    </Theme>
  );
}
