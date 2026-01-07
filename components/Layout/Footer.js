import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import logo from '../../assets/shashalogo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Company',
      links: [
        { text: 'About Us', href: '/about' },
        { text: 'Careers', href: '/careers' },
        { text: 'Press', href: '/press' },
        { text: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Support',
      links: [
        { text: 'Help Center', href: '/help' },
        { text: 'Contact Us', href: '/contact' },
        { text: 'Terms of Service', href: '/terms' },
        { text: 'Privacy Policy', href: '/privacy' },
      ],
    },
    {
      title: 'Events',
      links: [
        { text: 'Browse Events', href: '/events' },
        { text: 'Season Passes', href: '/seasonal-tickets' },
        { text: 'Create Event', href: '/events/create' },
        { text: 'Venues', href: '/venues' },
        { text: 'Organizer Guide', href: '/organizer-guide' },
      ],
    },
    {
      title: 'Partners',
      links: [
        { text: 'Become a Partner', href: '/partners' },
        { text: 'API Docs', href: '/api-docs' },
        { text: 'Affiliates', href: '/affiliate' },
      ],
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #0F2A44 0%, #0A1F33 100%)',
        color: '#E5ECF3',
        pt: 8,
        pb: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={1.5} sx={{ mx: -2 }}>
          {/* Logo Column */}
          <Grid item xs={12} md={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <img
                src={logo}
                alt="ShashaPass"
                style={{
                  height: 130,
                  width: 'auto',
                  objectFit: 'contain',
                }}
              />
            </Box>
          </Grid>

          {/* About Column */}
          <Grid item xs={12} md={2.5}>
            {/* Contact */}
            <Box sx={{ mt: 0.5 }}>
              {[
                { icon: <Email />, text: 'support@shashapass.com' },
                { icon: <Phone />, text: '+263 123 456 789' },
                { icon: <LocationOn />, text: 'Harare, Zimbabwe' },
              ].map((item, i) => (
                <Box
                  key={i}
                  sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                >
                  <Box sx={{ mr: 1.2, opacity: 0.9 }}>{item.icon}</Box>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Social */}
            <Box sx={{ mt: 3, display: 'flex', gap: 0.5 }}>
              {[Facebook, Twitter, Instagram, LinkedIn].map((Icon, i) => (
                <IconButton
                  key={i}
                  size="small"
                  sx={{
                    color: '#E5ECF3',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    padding: '6px',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: '#fff',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.25s ease',
                  }}
                >
                  <Icon />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Links */}
          {footerSections.map((section) => (
            <Grid item xs={6} md={1.8} key={section.title}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                gutterBottom
              >
                {section.title}
              </Typography>

              {section.links.map((link) => (
                <Link
                  key={link.text}
                  href={link.href}
                  underline="none"
                  sx={{
                    display: 'block',
                    mb: 1,
                    color: 'rgba(229,236,243,0.8)',
                    fontSize: 14,
                    '&:hover': {
                      color: '#fff',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 5, borderColor: 'rgba(255,255,255,0.15)' }} />

        {/* Bottom */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            © {currentYear} All rights reserved.
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            Made with ❤️ in Zimbabwe
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
