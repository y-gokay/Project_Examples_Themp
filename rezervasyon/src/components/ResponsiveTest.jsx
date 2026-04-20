import { Box, Typography, Paper, Grid } from "@mui/material";
import { useResponsive } from "../hooks/useResponsive";

export default function ResponsiveTest() {
  const responsive = useResponsive();

  return (
    <Paper elevation={2} sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Responsive Test
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ p: 2, bgcolor: "primary.light", borderRadius: 1 }}>
            <Typography variant="body2" color="white">
              Ekran Boyutu: {responsive.width} x {responsive.height}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ p: 2, bgcolor: "secondary.light", borderRadius: 1 }}>
            <Typography variant="body2" color="white">
              Cihaz:{" "}
              {responsive.isMobile
                ? "Mobil"
                : responsive.isTablet
                ? "Tablet"
                : "Desktop"}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ p: 2, bgcolor: "success.light", borderRadius: 1 }}>
            <Typography variant="body2" color="white">
              Breakpoint:{" "}
              {responsive.isXs
                ? "XS"
                : responsive.isSm
                ? "SM"
                : responsive.isMd
                ? "MD"
                : responsive.isLg
                ? "LG"
                : responsive.isXl
                ? "XL"
                : "2XL"}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Bu component responsive tasarımı test etmek için kullanılır.
        </Typography>
      </Box>
    </Paper>
  );
}

