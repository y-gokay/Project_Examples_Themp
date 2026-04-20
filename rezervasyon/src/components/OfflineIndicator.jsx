import { Alert, Slide } from "@mui/material";
import { useOffline } from "../hooks/useOffline";

export default function OfflineIndicator() {
  const isOffline = useOffline();

  return (
    <Slide direction="down" in={isOffline} mountOnEnter unmountOnExit>
      <Alert
        severity="warning"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          borderRadius: 0,
          "& .MuiAlert-message": {
            width: "100%",
            textAlign: "center",
          },
        }}
      >
        İnternet bağlantınız kesildi. Bazı özellikler kullanılamayabilir.
      </Alert>
    </Slide>
  );
}

