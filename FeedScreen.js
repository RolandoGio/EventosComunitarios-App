import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { FlatList, Image, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Datos de prueba (Simulando Firebase)
const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Taller de React Native',
    date: '20 Nov • 10:00 AM',
    location: 'Aula Magna',
    likes: 24,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    title: 'Hackathon 2024',
    date: '29 Nov • 08:00 AM',
    location: 'Lab de Computo',
    likes: 156,
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    title: 'Fiesta de Fin de Año',
    date: '31 Dic • 08:00 PM',
    location: 'Terraza Principal',
    likes: 89,
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
  },
];

// COMPONENTE TARJETA (Maneja su propio like)
const EventCard = ({ item }) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(item.likes);

    const handleLike = () => {
        if (liked) {
            setLikeCount(likeCount - 1);
        } else {
            setLikeCount(likeCount + 1);
        }
        setLiked(!liked);
    };

    return (
        <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.02)']}
            style={styles.card}
        >
            {/* Imagen Cuadrada */}
            <Image source={{ uri: item.image }} style={styles.cardImage} />

            {/* Columna de Info */}
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                
                <View style={styles.row}>
                    <AntDesign name="clockcircleo" size={12} color="#ccc" />
                    <Text style={styles.cardMeta}>{item.date}</Text>
                </View>

                <View style={styles.row}>
                    <Ionicons name="location-outline" size={14} color="#ccc" />
                    <Text style={styles.cardMeta}>{item.location}</Text>
                </View>
            </View>

            {/* Zona de Like (Estilo Instagram) */}
            <TouchableOpacity style={styles.likeContainer} onPress={handleLike}>
                <AntDesign 
                    name={liked ? "heart" : "hearto"} 
                    size={20} 
                    color={liked ? "#FF3B30" : "#fff"} 
                />
                <Text style={styles.likeCount}>{likeCount}</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
};

export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* FONDO GLOBAL */}
      <View style={styles.backgroundDark} />
      <View style={[styles.blob, styles.blobGreen]} />
      <View style={[styles.blob, styles.blobCyan]} />

      <View style={styles.contentContainer}>
          
          {/* ENCABEZADO */}
          <View style={styles.header}>
              <Text style={styles.headerTitle}>Explorar Eventos</Text>
              <View style={styles.avatar}>
                  <AntDesign name="user" size={20} color="#fff" />
              </View>
          </View>

          {/* BARRA DE BÚSQUEDA (GLASS) */}
          <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="rgba(255,255,255,0.7)" style={{marginRight: 10}}/>
              <TextInput 
                  placeholder="Buscar..." 
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={styles.searchInput}
              />
          </View>

          {/* LISTA DE EVENTOS */}
          <FlatList
              data={MOCK_EVENTS}
              renderItem={({ item }) => <EventCard item={item} />}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
          />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191919',
    alignItems: 'center', // Centrado para PC
  },
  contentContainer: {
    width: '100%',
    maxWidth: 500, // Limite ancho PC
    height: '100%',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  backgroundDark: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#191919',
  },
  // Blobs ajustados para PC y Móvil
  blob: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    ...Platform.select({ web: { filter: 'blur(100px)' } })
  },
  blobGreen: {
    backgroundColor: '#10B981',
    top: -100,
    left: -100,
    opacity: 0.2,
  },
  blobCyan: {
    backgroundColor: '#06B6D4',
    bottom: -100,
    right: -100,
    opacity: 0.2,
  },
  // HEADER
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
  },
  headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#fff',
  },
  avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  // SEARCH BAR
  searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 25, // Muy redondo
      paddingHorizontal: 15,
      height: 45,
      marginBottom: 30,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
      flex: 1,
      color: '#fff',
  },
  // TARJETA DE EVENTO
  card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 20,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      ...Platform.select({
        web: { backdropFilter: 'blur(10px)' } // Efecto cristal PC
      })
  },
  cardImage: {
      width: 80,
      height: 80,
      borderRadius: 15,
      marginRight: 15,
  },
  cardInfo: {
      flex: 1,
      justifyContent: 'center',
  },
  cardTitle: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 6,
  },
  row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
  },
  cardMeta: {
      color: '#ccc',
      fontSize: 12,
      marginLeft: 6,
  },
  // CONTADOR DE LIKES
  likeContainer: {
      alignItems: 'center',
      padding: 5,
  },
  likeCount: {
      color: '#fff',
      fontSize: 10,
      marginTop: 2,
  },
});