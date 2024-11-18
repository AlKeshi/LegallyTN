// LoadingPage.js
import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Lottie from 'react-lottie';
import animationData from './lotties/animation.json';
import './LoadingPage.css'; // Import the CSS for animated background

const sentences = [
  "Did you know? Tunisian law protects whistleblowers from retaliation.",
  "Tunisia was the first Arab country to abolish slavery in 1846.",
  "The Tunisian Constitution guarantees the right to a fair trial.",
  "Tunisian law ensures gender equality in inheritance through recent amendments.",
  "Freedom of expression is protected under Tunisian law, with some restrictions.",
  "Legal aid is provided by the state for those who can't afford it in Tunisia.",
  "In Tunisia, both men and women have the right to divorce.",
  "The Tunisian Labor Code includes strong protections for workers' rights.",
  "The age of criminal responsibility in Tunisia is 13 years.",
  "Tunisia has one of the most progressive women's rights laws in the Arab world.",
  "Cybercrime is punishable under Tunisian Penal Code.",
  "Tunisian law recognizes the right to peaceful assembly.",
  "Data privacy is protected by the 2004 Tunisian Data Protection Act.",
  "Tunisian courts must follow the principle of presumption of innocence.",
  "Harassment in the workplace is strictly forbidden by Tunisian labor law.",
  "The Tunisian judiciary is independent, as stated in the 2014 Constitution.",
  "Tunisia was a pioneer in adopting a law against human trafficking in 2016.",
  "Adoption is legally recognized and regulated in Tunisia.",
  "The Family Code grants rights to both biological and adopted children.",
  "Tunisia is committed to international human rights standards as a signatory of many conventions."
];

const LoadingPage = () => {
  const [randomSentence, setRandomSentence] = useState('');
  
  useEffect(() => {
    // Randomly select one of the 20 sentences
    const randomIndex = Math.floor(Math.random() * sentences.length);
    setRandomSentence(sentences[randomIndex]);
  }, []);

  const defaultOptions = {
    loop: true,
    autoplay: true, 
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return (
    <Box
      className="loading-page"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: 'white',
      }}
    >
      {/* Lottie animation */}
      <Lottie options={defaultOptions} height={200} width={200} />

      {/* Random sentence */}
      <Typography variant="h6" sx={{ mt: 4, textAlign: 'center', maxWidth: '80%' }}>
        {randomSentence}
      </Typography>
    </Box>
  );
};

export default LoadingPage;
