// src/components/pdf/AlbumPdf.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// Estilos del documento PDF (A4)
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#FAF9F6",
    fontFamily: "Helvetica",
  },
  // Portada
  coverPage: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    textAlign: "center",
  },
  coverTitle: {
    fontSize: 28,
    color: "#1e293b",
    marginBottom: 8,
    fontFamily: "Helvetica-Bold",
  },
  coverSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
  },
  coverDivider: {
    width: 60,
    height: 2,
    backgroundColor: "#d97706",
    marginBottom: 24,
  },
  coverFooter: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 40,
  },
  // Encabezado de páginas internas
  header: {
    fontSize: 10,
    color: "#94a3b8",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 8,
    marginBottom: 20,
    textAlign: "right",
  },
  // Tarjetas de Condolencias
  condolenciaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  autor: {
    fontSize: 12,
    color: "#1e293b",
    fontFamily: "Helvetica-Bold",
  },
  parentesco: {
    fontSize: 10,
    color: "#d97706",
    marginBottom: 8,
  },
  mensaje: {
    fontSize: 10,
    color: "#334155",
    lineHeight: 1.5,
    fontStyle: "italic",
    marginBottom: 10,
  },
  foto: {
    width: "100%",
    height: 180,
    borderRadius: 6,
    objectFit: "cover",
    marginTop: 8,
  },
  fecha: {
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "right",
    marginTop: 6,
  },
});

interface CondolenciaPDF {
  id: string;
  nombreAutor: string;
  parentesco?: string | null;
  mensaje: string;
  fotoUrl?: string | null;
  creadoEn: Date | string;
}

interface AlbumPdfProps {
  nombreDifunto: string;
  fechaFallecimiento: string;
  nombreFuneraria: string;
  condolencias: CondolenciaPDF[];
}

export const AlbumPdf = ({
  nombreDifunto,
  fechaFallecimiento,
  nombreFuneraria,
  condolencias,
}: AlbumPdfProps) => (
  <Document>
    {/* PÁGINA 1: PORTADA */}
    <Page size="A4" style={styles.page}>
      <View style={styles.coverPage}>
        <Text style={styles.coverSubtitle}>En Memoria de</Text>
        <Text style={styles.coverTitle}>{nombreDifunto}</Text>
        <View style={styles.coverDivider} />
        <Text style={styles.coverSubtitle}>{fechaFallecimiento}</Text>
        <Text style={styles.coverFooter}>
          Álbum de Recuerdos y Condolencias • {nombreFuneraria}
        </Text>
      </View>
    </Page>

    {/* PÁGINA 2 EN ADELANTE: CONDOLENCIAS */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Libro de Condolencias • {nombreDifunto}</Text>

      {condolencias.map((item) => (
        <View key={item.id} style={styles.condolenciaCard} wrap={false}>
          <Text style={styles.autor}>{item.nombreAutor}</Text>
          {item.parentesco && (
            <Text style={styles.parentesco}>{item.parentesco}</Text>
          )}

          <Text style={styles.mensaje}>"{item.mensaje}"</Text>

          {item.fotoUrl && (
            <Image style={styles.foto} src={item.fotoUrl} />
          )}

          <Text style={styles.fecha}>
            {new Date(item.creadoEn).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
      ))}
    </Page>
  </Document>
);