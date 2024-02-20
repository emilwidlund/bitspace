'use client'

import { ChevronLeftOutlined, ChevronRightOutlined, CloseOutlined } from '@mui/icons-material';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import { Panel } from '../Panel/Panel';

export interface JourneyProps {
  persistenceKey: string;
  steps: JourneyStepProps[];
}

export const Journey = ({ persistenceKey, steps }: JourneyProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const step = useMemo(() => steps[currentStep], [currentStep, steps]);
  const nextStep = useMemo(() => steps[currentStep + 1], [currentStep, steps]);
  const previousStep = useMemo(() => steps[currentStep - 1], [currentStep, steps]);

  const handleFinish = useCallback(() => {
    localStorage.setItem(persistenceKey, 'true');
    setFinished(true);
  }, [setFinished]);

  if (typeof window !== 'undefined' && window.localStorage && localStorage.getItem(persistenceKey) || finished) return null;

  return (
    <Panel
      className="absolute left-12 bottom-12 w-80 max-h-[360px] h-full justify-between bg-slate-50"
      variants={{
        initial: { y: 300, opacity: 0 },
        animate: { y: 0, opacity: 1, transition: { duration: 1.6, ease: [0.75, 0, 0.25, 1] } }
      }}
    >
      <motion.div
        className="h-full w-full flex flex-col"
        variants={{
          initial: { y: 40, opacity: 0 },
          animate: { y: 0, opacity: 1, transition: { duration: 2, ease: [0.75, 0, 0.25, 1] } }
        }}
      >
        {step && <JourneyStep key={step.title} step={step} />}
      </motion.div>
      <div className="flex flex-row justify-between items-center">
        <motion.button
          className={clsx('bg-slate-200 text-slate-400 rounded-xl p-2', {
            'opacity-50': !previousStep
          })}
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={!previousStep}
        >
          <ChevronLeftOutlined />
        </motion.button>

        <span className="text-sm text-slate-400">
          {currentStep + 1} / {steps.length}
        </span>

        {
          <motion.button
            className={clsx('rounded-xl w-10 h-10 flex flex-col items-center justify-center', {
              'text-slate-400': !!nextStep,
              'bg-slate-200': !!nextStep,
              'text-white': !nextStep,
              'bg-blue-500': !nextStep
            })}
            onClick={() => (nextStep ? setCurrentStep(currentStep + 1) : handleFinish())}
          >
            {nextStep ? <ChevronRightOutlined /> : <CloseOutlined fontSize="small" />}
          </motion.button>
        }
      </div>
    </Panel>
  );
};

export interface JourneyStepProps {
  title: string;
  description: string;
  image?: string;
}

export const JourneyStep = ({ step }: { step: JourneyStepProps }) => {
  return (
    <motion.div
      className="flex flex-col gap-y-4 flex-grow"
      variants={{
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 1, ease: 'linear' } }
      }}
    >
      {step.image && (
        <motion.div
          className="rounded-2xl bg-cover bg-center w-full max-h-32 h-full"
          style={{
            backgroundImage: `url(${step.image})`
          }}
        />
      )}
      <motion.h3 className="text-xl font-medium leading-snug">{step.title}</motion.h3>
      <motion.p className="text-slate-500 leading-relaxed">{step.description}</motion.p>
    </motion.div>
  );
};
