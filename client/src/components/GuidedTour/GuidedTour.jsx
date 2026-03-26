import React, { useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import useStore from '../../store/useStore';

const GuidedTour = () => {
  const { isTourOpen, setIsTourOpen } = useStore();
  
  const steps = [
    {
      target: '#tour-sidebar',
      content: 'Welcome to SystemScope! From here, you can drag and drop components onto the canvas to build your architecture. Or click a Template to auto-populate a baseline system.',
      disableBeacon: true,
    },
    {
      target: '#tour-canvas',
      content: 'The canvas is an infinite workspace. Connect Nodes by dragging lines between their handles to establish flow!',
    },
    {
      target: '#tour-config-panel',
      content: 'When a node is clicked, this panel lets you rename it and finely tune specific load limits (like capacity and latency). You can also configure specific database or cache engines here!',
    },
    {
      target: '#tour-run-simulation',
      content: 'Once ready, set a Load Generator (Req/s) limit and hit this button. The engine will calculate latency and capacity cascades natively tracking traffic bottlenecks in real-time!',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setIsTourOpen(false);
      localStorage.setItem('hasSeenTour', 'true');
    }
  };

  useEffect(() => {
    if (localStorage.getItem('hasSeenTour') !== 'true') {
      setIsTourOpen(true);
    }
  }, [setIsTourOpen]);

  return (
    <Joyride
      steps={steps}
      run={isTourOpen}
      continuous
      scrollToFirstStep
      showSkipButton
      showProgress
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#6366f1',
          textColor: '#f8fafc',
          backgroundColor: '#1e293b',
          overlayColor: 'rgba(15, 23, 42, 0.7)',
        },
        tooltipContainer: {
          textAlign: 'left',
          fontSize: '14px'
        },
        buttonNext: {
          backgroundColor: '#6366f1',
          borderRadius: '6px'
        },
        buttonBack: {
          color: '#94a3b8'
        },
        buttonSkip: {
          color: '#ef4444'
        }
      }}
    />
  );
};

export default GuidedTour;
