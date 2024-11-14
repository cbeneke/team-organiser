import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
// import Link from '@mui/material/Link';
// import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const defaultTheme = createTheme();
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
    throw new Error('API_URL environment variable is not set');
}

export const Login:React.FC = ()=>{
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const email = data.get('email');
      const password = data.get('password');

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
          },
          body: 'grant_type=password&username=' + encodeURIComponent(email as string) + '&password=' + encodeURIComponent(password as string) + '&scope=&client_id=&client_secret='
      });

        if (!response.ok) {
          throw new Error('Netzwerkantwort war nicht erfolgreich');
        }

        const result = await response.json();
        localStorage.setItem('access_token', result.access_token);
        window.location.href = '/calendar';
      } catch (error) {
        console.error('Es gab ein Problem bei der Anmeldung:', error);
      }
    };
    
    return (
      <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h5">
              Anmelden
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="E-Mail-Adresse"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Passwort"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Angemeldet bleiben"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Anmelden
              </Button>
              {/* <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Passwort vergessen?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Noch kein Konto? Jetzt registrieren"}
                  </Link>
                </Grid>
              </Grid> */}
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    );
}