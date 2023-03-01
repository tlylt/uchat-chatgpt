import { useRef, useState } from 'react';
import useSWR from 'swr';
import { toast } from 'react-toastify';

const Form = () => {
  const messageInput = useRef<HTMLTextAreaElement | null>(null);
  const [response, setResponse] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currConversationId, setCurrConversationId] = useState<string>('');
  const [currMessageId, setCurrMessageId] = useState<string>('');

  const handleEnter = (
    e: React.KeyboardEvent<HTMLTextAreaElement> &
      React.FormEvent<HTMLFormElement>
  ) => {
    if (e.key === 'Enter' && isLoading === false) {
      e.preventDefault();
      setIsLoading(true);
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userMessage = messageInput.current?.value;
    if (userMessage === '') {
      toast.warn(
        'The message cannot be empty. Please enter a message to continue.'
      );
      return;
    }
    if (userMessage !== undefined) {
      setResponse((prev) => [...prev, userMessage]);
      messageInput.current!.value = '';
    }

    try {
      const { message, messageId, conversationId } = await (
        await fetch('/api/main', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            conversationId: currConversationId,
            parentMessageId: currMessageId,
          }),
        })
      ).json();

      if (currConversationId !== conversationId) {
        setCurrConversationId(conversationId);
        localStorage.setItem('mock-gpt-conversationId', conversationId);
      }
      if (currMessageId !== messageId) {
        setCurrMessageId(messageId);
        localStorage.setItem('mock-gpt-messageId', messageId);
      }

      const totalResponse: string[] = [...response, userMessage, message];
      setResponse(totalResponse);
      localStorage.setItem('mock-gpt-response', JSON.stringify(totalResponse));
    } catch (error) {
      console.error(error);
      toast.error(
        'An error occurred while fetching the response. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('mock-gpt-response');
    localStorage.removeItem('mock-gpt-conversationId');
    localStorage.removeItem('mock-gpt-messageId');
    setCurrConversationId('');
    setCurrMessageId('');
    setResponse([]);
  };

  useSWR('fetchingResponse', async () => {
    const storedResponse = localStorage.getItem('mock-gpt-response');
    if (storedResponse) {
      setResponse(JSON.parse(storedResponse));
    }
    const storedConversationId = localStorage.getItem(
      'mock-gpt-conversationId'
    );
    if (storedConversationId) {
      setCurrConversationId(storedConversationId);
    }
    const storedMessageId = localStorage.getItem('mock-gpt-messageId');
    if (storedMessageId) {
      setCurrMessageId(storedMessageId);
    }
  });

  return (
    <div className="flex justify-center">
      <button
        onClick={handleReset}
        type="reset"
        className="fixed p-4 font-bold text-white bg-teal-500 rounded-md top-5 right-5 dark:hover:text-gray-400 dark:hover:bg-gray-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
      >
        Clear History
      </button>
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-5 w-full md:max-w-3xl bg-white-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] mb-4"
      >
        <textarea
          name="Message"
          placeholder="Type your message here..."
          // minLength={1}
          ref={messageInput}
          onKeyDown={handleEnter}
          className="w-full pt-4 pl-4 translate-y-1 bg-transparent shadow-lg outline-none resize-none"
        />
        <button
          disabled={isLoading}
          type="submit"
          className="absolute top-[1.4rem] right-5 p-1 rounded-md text-gray-500 dark:hover:text-gray-400 dark:hover:bg-gray-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 20 20"
            className="w-4 h-4 rotate-90"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
          </svg>
        </button>
      </form>
      <div className="flex flex-col items-start w-full gap-3 pt-6 pb-20 mx-2 last:mb-10 md:mx-auto md:max-w-3xl h-5/6">
        {response
          ? response.map((item: string, index: number) => {
              return (
                <div
                  key={index}
                  className={`${
                    index % 2 === 0 ? 'bg-green-200 ml-auto' : 'bg-blue-200'
                  } p-4 rounded-2xl`}
                >
                  <p>{item}</p>
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
};

export default Form;
