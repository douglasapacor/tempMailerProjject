import { CloudUpload, Send } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  LinearProgress,
  LinearProgressProps,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import Head from "next/head";
import React, { ChangeEvent, useEffect, useState } from "react";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number }
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function HomePage() {
  const [nomeLista, setNomeLista] = useState<string>("");
  const [pathFileLista, setPathFileLista] = useState<string>("");
  const [assunto, setAssunto] = useState<string>("");

  const [nomeHtml, setNomeHtml] = useState<string>("");
  const [pathFileHtml, setPathFileHtml] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  const [enviados, setEnviados] = useState<number>(0);
  const [percent, setPercent] = useState<number>(0);

  const [message, setMessage] = useState<string>(
    "Selecione lista e html e clique em enviar."
  );

  useEffect(() => {
    window.ipc.on("addTotal", (data: number) => {
      console.log("addTotal", data);
      setTotal((total) => total + data);
    });

    window.ipc.on("sended", (data: number) => {
      console.log("sended", data);
      setEnviados((enviados) => enviados + data);
    });
  }, []);

  useEffect(() => {
    const res = (enviados / total) * 100;

    if (!isNaN(res)) setPercent(res);
  }, [total, enviados]);

  const enviar = () => {
    if (!pathFileLista) {
      setMessage("Selecione a Lista de envio.");
      return;
    }

    if (!pathFileHtml) {
      setMessage("Selecione arquivo HTML.");
      return;
    }

    if (!pathFileHtml) {
      setMessage("preencha o assunto.");
      return;
    }

    window.ipc.send("startProcess", {
      pathFileLista,
      pathFileHtml,
      subject: assunto,
    });
  };

  return (
    <React.Fragment>
      <Head>
        <title>Mailer - INR Envio de email</title>
      </Head>
      <Container>
        <Box sx={{ paddingTop: 5 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <Alert variant="filled" severity="info">
                {message}
              </Alert>
            </Grid>
            <Grid item xs={12} sm={12} md={2} lg={2} xl={2}>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUpload />}
                fullWidth
              >
                Lista
                <VisuallyHiddenInput
                  type="file"
                  accept=".csv"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setNomeLista(e.target.files[0].name);
                    setPathFileLista(e.target.files[0].path);
                    setMessage("Lista selecionada");
                  }}
                />
              </Button>
            </Grid>

            <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
              <TextField
                variant="standard"
                label="nome do arquivo"
                fullWidth
                value={nomeLista}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <TextField
                variant="standard"
                label="caminho"
                fullWidth
                value={pathFileLista}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={2} lg={2} xl={2}>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUpload />}
                fullWidth
              >
                HTML
                <VisuallyHiddenInput
                  type="file"
                  accept=".html"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setNomeHtml(e.target.files[0].name);
                    setPathFileHtml(e.target.files[0].path);
                    setMessage("HTML selecionado");
                  }}
                />
              </Button>
            </Grid>

            <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
              <TextField
                variant="standard"
                label="nome do arquivo"
                fullWidth
                value={nomeHtml}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <TextField
                variant="standard"
                label="caminho"
                fullWidth
                value={pathFileHtml}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <TextField
                variant="standard"
                label="Assunto"
                fullWidth
                value={assunto}
                onChange={(e) => {
                  setAssunto(e.target.value);
                }}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <Button
                component="label"
                variant="contained"
                startIcon={<Send />}
                fullWidth
                onClick={enviar}
              >
                Enviar
              </Button>
            </Grid>

            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <LinearProgressWithLabel value={percent} />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </React.Fragment>
  );
}
