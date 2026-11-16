// Which help is playing and which microphone is listening, for the buttons (Batch 5).
import { useSyncExternalStore } from 'react';
import { getAudioState, subscribeAudio } from './audio';

export const useAudioState = () => useSyncExternalStore(subscribeAudio, getAudioState, getAudioState);
