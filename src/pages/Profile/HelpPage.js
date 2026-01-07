import React from 'react';
import { Container, Typography, Box, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, Link } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const helpTopics = [
  {
    question: 'How do I buy a ticket?',
    answer: 'Browse events, select your desired event, choose your ticket type and quantity, then proceed to checkout. You will receive your ticket by email or in your account.'
  },
  {
    question: 'How do I view my tickets?',
    answer: 'Go to your profile and select the Tickets section. All your purchased tickets will be listed there.'
  },
  {
    question: 'How do I contact support?',
    answer: 'You can contact support by emailing support@example.com or using the contact form on our website.'
  },
  {
    question: 'Can I transfer my ticket to someone else?',
    answer: 'Yes, you can transfer eligible tickets from your Tickets page. Click on the ticket and select the transfer option.'
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept major credit cards, PayPal, and other local payment methods depending on your region.'
  },
  {
    question: 'Where can I find more information?',
    answer: 'Visit our FAQ or contact support for more details.'
  }
];

const HelpPage = () => (
  <Container maxWidth="md" sx={{ py: 4 }}>
    <Typography variant="h4" gutterBottom>Help & Support</Typography>
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Frequently Asked Questions</Typography>
        {helpTopics.map((topic, idx) => (
          <Accordion key={idx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{topic.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{topic.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
        <Box sx={{ mt: 4 }}>
          <Typography variant="body2">
            Still need help? <Link href="mailto:support@example.com">Contact Support</Link>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  </Container>
);

export default HelpPage;
