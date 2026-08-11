import React, { useState, useEffect } from 'react';
import './FlipClock.css';

const AnimatedCard = ({ animation, digit }) => {
  return (
    <div className={`flipCard ${animation}`}>
      <span>{digit}</span>
    </div>
  );
};

const StaticCard = ({ position, digit }) => {
  return (
    <div className={position}>
      <span>{digit}</span>
    </div>
  );
};

const FlipUnitContainer = ({ digit, shuffle, unit }) => {
  let currentDigit = digit;
  let previousDigit = digit - 1;

  if (unit !== 'hours') {
    previousDigit = previousDigit === -1 ? 59 : previousDigit;
  } else {
    previousDigit = previousDigit === -1 ? 23 : previousDigit;
  }

  if (currentDigit < 10) {
    currentDigit = `0${currentDigit}`;
  }
  if (previousDigit < 10) {
    previousDigit = `0${previousDigit}`;
  }

  const digit1 = shuffle ? previousDigit : currentDigit;
  const digit2 = !shuffle ? previousDigit : currentDigit;

  const animation1 = shuffle ? 'fold' : 'unfold';
  const animation2 = !shuffle ? 'fold' : 'unfold';

  return (
    <div className={'flipUnitContainer'}>
      <StaticCard position={'upperCard'} digit={currentDigit} />
      <StaticCard position={'lowerCard'} digit={previousDigit} />
      <AnimatedCard digit={digit1} animation={animation1} />
      <AnimatedCard digit={digit2} animation={animation2} />
      <div className="unitLabel">{unit.toUpperCase()}</div>
    </div>
  );
};

const FlipClock = () => {
  const [time, setTime] = useState({
    hours: 0,
    hoursShuffle: true,
    minutes: 0,
    minutesShuffle: true,
    seconds: 0,
    secondsShuffle: true,
  });

  useEffect(() => {
    const timerID = setInterval(() => updateTime(), 1000);
    return () => clearInterval(timerID);
  }, [time]);

  const updateTime = () => {
    const d = new Date();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();

    if (hours !== time.hours) {
      const hoursShuffle = !time.hoursShuffle;
      setTime(prev => ({ ...prev, hours, hoursShuffle }));
    }
    if (minutes !== time.minutes) {
      const minutesShuffle = !time.minutesShuffle;
      setTime(prev => ({ ...prev, minutes, minutesShuffle }));
    }
    if (seconds !== time.seconds) {
      const secondsShuffle = !time.secondsShuffle;
      setTime(prev => ({ ...prev, seconds, secondsShuffle }));
    }
  };

  return (
    <div className="flipClockContainer">
      <FlipUnitContainer unit={'hours'} digit={time.hours} shuffle={time.hoursShuffle} />
      <FlipUnitContainer unit={'minutes'} digit={time.minutes} shuffle={time.minutesShuffle} />
      <FlipUnitContainer unit={'seconds'} digit={time.seconds} shuffle={time.secondsShuffle} />
    </div>
  );
};

export default FlipClock;
