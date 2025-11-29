import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// FIREBASE IMPORTS
import {
    createUserWithEmailAndPassword,
    getRedirectResult,
    GithubAuthProvider,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect
} from 'firebase/auth';
import { auth } from './firebaseConfig';

// DATOS INICIALES (AHORA CON HORA Y LISTAS)
const INITIAL_EVENTS = [
    { 
        id: '1', title: 'Taller de React Native', date: '20/11/2024', time: '10:00 AM', location: 'Aula Magna', 
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
        likedBy: [], attendingList: ['test@test.com', 'juan@gmail.com'] // Simulamos 2 asistentes
    },
    { 
        id: '2', title: 'Hackathon 2024', date: '29/11/2024', time: '08:00 AM', location: 'Lab de Computo', 
        image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
        likedBy: [], attendingList: ['pepe@gmail.com']
    },
    { 
        id: '3', title: 'Fiesta de Fin de Año', date: '31/12/2024', time: '08:00 PM', location: 'Terraza Principal', 
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
        likedBy: [], attendingList: []
    },
];

// --- COMPONENTE: TARJETA DE EVENTO ---
const EventCard = ({ item, onPress, onToggleLike, currentUserEmail }) => {
    const isLikedByMe = item.likedBy.includes(currentUserEmail);
    const isAttending = item.attendingList.includes(currentUserEmail);
    const totalLikes = item.likedBy.length;
    const totalAttendees = item.attendingList.length; // <--- CONTADOR DE ASISTENTES

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)']} style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                
                <View style={styles.cardInfo}>
                    {isAttending && (
                        <View style={styles.attendingBadge}>
                            <Text style={styles.attendingText}>ASISTIRÉ ✅</Text>
                        </View>
                    )}

                    <Text style={styles.cardTitle}>{item.title}</Text>
                    
                    {/* FECHA Y HORA */}
                    <View style={styles.row}>
                        <Ionicons name="calendar-outline" size={14} color="#ccc" />
                        <Text style={styles.cardMeta}>{item.date} • {item.time}</Text>
                    </View>
                    
                    <View style={styles.row}>
                        <Ionicons name="location-outline" size={14} color="#ccc" />
                        <Text style={styles.cardMeta}>{item.location}</Text>
                    </View>

                    {/* CONTADOR DE ASISTENTES (NUEVO) */}
                    <View style={[styles.row, {marginTop: 5}]}>
                        <Ionicons name="people-outline" size={14} color="#10B981" />
                        <Text style={[styles.cardMeta, {color:'#10B981'}]}>{totalAttendees} Asistentes</Text>
                    </View>
                </View>
                
                <TouchableOpacity style={styles.likeContainer} onPress={() => onToggleLike(item.id)}>
                    <Ionicons name={isLikedByMe ? "heart" : "heart-outline"} size={22} color={isLikedByMe ? "#FF3B30" : "#fff"} />
                    <Text style={styles.likeCount}>{totalLikes}</Text>
                </TouchableOpacity>
            </LinearGradient>
        </TouchableOpacity>
    );
};

// --- PANTALLA: PERFIL ---
const ProfileScreen = ({ user, events, onBack, onLogout, onResetData }) => {
    const myHistory = events.filter(e => e.attendingList.includes(user.email));

    return (
        <View style={styles.container}>
            <View style={styles.backgroundDark} />
            <View style={[styles.blob, styles.blobGreen]} />
            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
                    <Text style={styles.headerTitle}>Mi Perfil</Text>
                    <TouchableOpacity onPress={onLogout}><AntDesign name="logout" size={20} color="#FF4444" /></TouchableOpacity>
                </View>

                <View style={{alignItems:'center', marginBottom: 20}}>
                    <View style={styles.profileAvatar}><Text style={{fontSize: 30}}>👤</Text></View>
                    <Text style={styles.profileEmail}>{user.email}</Text>
                </View>

                <View style={styles.statsRow}>
                    <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']} style={styles.statBox}>
                        <Text style={styles.statNumber}>{events.length}</Text><Text style={styles.statLabel}>Total Eventos</Text>
                    </LinearGradient>
                    <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']} style={styles.statBox}>
                        <Text style={styles.statNumber}>{myHistory.length}</Text><Text style={styles.statLabel}>Mis Asistencias</Text>
                    </LinearGradient>
                </View>

                <Text style={styles.sectionTitle}>Historial de Asistencia</Text>
                <FlatList 
                    data={myHistory}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={<Text style={{color:'#aaa', fontStyle:'italic'}}>No has confirmado asistencia a nada.</Text>}
                    renderItem={({item}) => (
                        <View style={styles.historyItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{marginRight:10}} />
                            <View>
                                <Text style={{color:'white', fontWeight:'bold'}}>{item.title}</Text>
                                <Text style={{color:'#aaa', fontSize:12}}>{item.date} • {item.time}</Text>
                            </View>
                        </View>
                    )}
                />

                <TouchableOpacity style={styles.resetBtn} onPress={onResetData}>
                    <Ionicons name="trash-outline" size={18} color="white" style={{marginRight: 5}}/>
                    <Text style={{color:'white', fontWeight:'bold'}}>Restablecer Datos Globales</Text>
                </TouchableOpacity>

                <View style={{marginTop: 10, alignItems:'center'}}>
                    <Text style={{color:'rgba(255,255,255,0.3)', fontSize: 10}}>Licencia CC BY-NC 4.0</Text>
                </View>
            </View>
        </View>
    );
};

// --- PANTALLA: DETALLE ---
const DetailScreen = ({ event, userEmail, onBack, onToggleRSVP }) => {
    const isAttending = event.attendingList.includes(userEmail);
    const handleConfirm = () => {
        onToggleRSVP(event.id);
        if (!isAttending) Alert.alert("Registrado", "Tu asistencia ha sido confirmada.");
        else Alert.alert("Cancelado", "Has retirado tu asistencia.");
    };
    return (
        <View style={styles.container}>
            <View style={styles.backgroundDark} />
            <View style={[styles.blob, styles.blobGreen]} />
            <LinearGradient colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']} style={styles.detailCard}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}><Ionicons name="arrow-back" size={28} color="white" /></TouchableOpacity>
                <Image source={{ uri: event.image }} style={styles.detailImage} />
                <Text style={styles.detailTitle}>{event.title}</Text>
                <View style={styles.detailRow}><Ionicons name="calendar" size={20} color="#10B981" /><Text style={styles.detailText}>{event.date}</Text></View>
                <View style={styles.detailRow}><Ionicons name="time" size={20} color="#10B981" /><Text style={styles.detailText}>{event.time}</Text></View>
                <View style={styles.detailRow}><Ionicons name="location" size={20} color="#10B981" /><Text style={styles.detailText}>{event.location}</Text></View>
                <View style={styles.detailRow}><Ionicons name="people" size={20} color="#10B981" /><Text style={styles.detailText}>{event.attendingList.length} Personas asistirán</Text></View>
                
                <View style={styles.descContainer}><Text style={styles.descLabel}>Descripción</Text><Text style={styles.descText}>{event.description || "Detalles del evento."}</Text></View>
                
                <TouchableOpacity style={[styles.rsvpBtn, isAttending && styles.rsvpBtnActive]} onPress={handleConfirm}>
                    <Ionicons name={isAttending ? "close-circle-outline" : "checkmark-circle-outline"} size={24} color="white" style={{marginRight: 10}}/>
                    <Text style={styles.loginText}>{isAttending ? "Cancelar Asistencia" : "Confirmar Asistencia"}</Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
};

// --- PANTALLA: CREAR EVENTO (CON HORA) ---
const CreateScreen = ({ onBack, onCreate }) => {
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [desc, setDesc] = useState('');
    const [imageUri, setImageUri] = useState(null);
    
    // FECHA Y HORA
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [webDateText, setWebDateText] = useState(''); 
    const [webTimeText, setWebTimeText] = useState(''); 
    
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 1 });
        if (!result.canceled) setImageUri(result.assets[0].uri);
    };

    const formatDate = (d) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    const formatTime = (t) => t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const handlePublish = () => {
        const finalDate = Platform.OS === 'web' ? (webDateText || formatDate(new Date())) : formatDate(date);
        const finalTime = Platform.OS === 'web' ? (webTimeText || formatTime(new Date())) : formatTime(time);

        if(!title || !location) { Alert.alert("Faltan datos", "Llena los campos principales."); return; }
        
        const newEvent = {
            id: Date.now().toString(), 
            title, 
            date: finalDate, 
            time: finalTime,
            location, description: desc, likedBy: [], attendingList: [],
            image: imageUri || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80' 
        };
        onCreate(newEvent);
    };
    
    // Inputs Web
    const WebDatePicker = () => React.createElement('input', { type: 'date', onChange: (e) => setWebDateText(e.target.value), style: { width: '100%', height: 50, backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 15, padding: '0 15px', color: 'white', fontSize: 16, marginBottom: 15 } });
    const WebTimePicker = () => React.createElement('input', { type: 'time', onChange: (e) => setWebTimeText(e.target.value), style: { width: '100%', height: 50, backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 15, padding: '0 15px', color: 'white', fontSize: 16, marginBottom: 15 } });

    return (
        <View style={styles.container}>
            <View style={styles.backgroundDark} />
            <View style={[styles.blob, styles.blobCyan]} />
            <LinearGradient colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']} style={styles.glassCard}>
                <View style={{flexDirection:'row', alignItems:'center', width:'100%', marginBottom: 20}}>
                    <TouchableOpacity onPress={onBack}><Ionicons name="close" size={28} color="white" /></TouchableOpacity>
                    <Text style={[styles.title, {marginBottom:0, marginLeft: 20}]}>Crear Evento</Text>
                </View>
                <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                    {imageUri ? <Image source={{ uri: imageUri }} style={{width: '100%', height: '100%', borderRadius: 20}} /> : <><Ionicons name="camera" size={40} color="rgba(255,255,255,0.5)" /><Text style={{color:'rgba(255,255,255,0.5)', marginTop: 5}}>Subir portada</Text></>}
                </TouchableOpacity>
                <TextInput style={styles.inputGlass} placeholder="Título del Evento" placeholderTextColor="#aaa" value={title} onChangeText={setTitle}/>
                
                {/* FECHA Y HORA */}
                {Platform.OS === 'web' ? (
                    <>
                        <WebDatePicker />
                        <WebTimePicker />
                    </>
                ) : (
                    <>
                        {/* Selector FECHA Movil */}
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.inputGlass, {justifyContent:'center'}]}>
                            <View style={{flexDirection:'row', alignItems:'center'}}><Ionicons name="calendar-outline" size={20} color="#aaa" style={{marginRight: 10}}/><Text style={{color: 'white', fontSize: 14}}>{formatDate(date)}</Text></View>
                        </TouchableOpacity>
                        {showDatePicker && <DateTimePicker value={date} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(Platform.OS==='ios'); if(d) setDate(d); }} themeVariant="dark" />}
                        
                        {/* Selector HORA Movil */}
                        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={[styles.inputGlass, {justifyContent:'center'}]}>
                            <View style={{flexDirection:'row', alignItems:'center'}}><Ionicons name="time-outline" size={20} color="#aaa" style={{marginRight: 10}}/><Text style={{color: 'white', fontSize: 14}}>{formatTime(time)}</Text></View>
                        </TouchableOpacity>
                        {showTimePicker && <DateTimePicker value={time} mode="time" display="default" onChange={(e, d) => { setShowTimePicker(Platform.OS==='ios'); if(d) setTime(d); }} themeVariant="dark" />}
                    </>
                )}

                <TextInput style={styles.inputGlass} placeholder="Ubicación" placeholderTextColor="#aaa" value={location} onChangeText={setLocation}/>
                <TextInput style={[styles.inputGlass, {height: 80, paddingTop: 10}]} placeholder="Descripción" placeholderTextColor="#aaa" multiline value={desc} onChangeText={setDesc}/>
                <TouchableOpacity style={styles.loginBtn} onPress={handlePublish}><Text style={styles.loginText}>Publicar Evento</Text></TouchableOpacity>
            </LinearGradient>
        </View>
    );
};

// --- APP PRINCIPAL ---
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login'); 
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [events, setEvents] = useState([]);

  // CARGAR DATOS
  useEffect(() => {
    const loadData = async () => {
        try {
            const savedEvents = await AsyncStorage.getItem('global_events_db');
            if (savedEvents) {
                setEvents(JSON.parse(savedEvents));
            } else {
                setEvents(INITIAL_EVENTS);
            }
        } catch (e) { console.log("Error cargando", e); }
    };
    loadData();
  }, []);

  const saveEventsToStorage = async (newEvents) => {
      setEvents(newEvents);
      try {
          await AsyncStorage.setItem('global_events_db', JSON.stringify(newEvents));
      } catch (e) { console.log("Error guardando", e); }
  };

  const toggleRSVP = (id) => {
      if (!currentUser) return;
      const userEmail = currentUser.email;
      const updated = events.map(e => {
          if (e.id === id) {
              const alreadyAttending = e.attendingList.includes(userEmail);
              let newList = alreadyAttending ? e.attendingList.filter(email => email !== userEmail) : [...e.attendingList, userEmail];
              return { ...e, attendingList: newList };
          }
          return e;
      });
      saveEventsToStorage(updated);
  };

  const toggleLike = (id) => {
      if (!currentUser) return;
      const userEmail = currentUser.email;
      const updated = events.map(e => {
          if (e.id === id) {
              const alreadyLiked = e.likedBy.includes(userEmail);
              let newLikedBy = alreadyLiked ? e.likedBy.filter(email => email !== userEmail) : [...e.likedBy, userEmail];
              return { ...e, likedBy: newLikedBy };
          }
          return e;
      });
      saveEventsToStorage(updated);
  };

  const handleCreateEvent = (newEvent) => {
      const updated = [newEvent, ...events];
      saveEventsToStorage(updated);
      setView('feed');
      Alert.alert("¡Éxito!", "Evento publicado globalmente.");
  };

  const handleResetData = async () => {
      await AsyncStorage.removeItem('global_events_db');
      setEvents(INITIAL_EVENTS);
      Alert.alert("Reiniciado", "Base de datos local limpia.");
  };

  // --- AUTH ---
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) { setCurrentUser(user); setView('feed'); setLoading(false); }
      else { setCurrentUser(null); setView('login'); }
    });
    if (Platform.OS === 'web') getRedirectResult(auth).catch(console.log);
    return unsubscribe; 
  }, []);

  const handleEmailAuth = async () => {
    if (!email || !password) { Alert.alert("Error", "Faltan datos"); return; }
    setLoading(true);
    try {
      if (isRegistering) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (e) { setLoading(false); Alert.alert("Error", e.message); }
  };

  const handleSocialLogin = async (providerName) => {
    setLoading(true);
    try {
      let provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user' || e.message.includes('BLOCKED')) {
          if (Platform.OS === 'web') await signInWithRedirect(auth, provider);
          else Alert.alert("Error", "Navegador bloqueó el popup.");
      } else { setLoading(false); Alert.alert("Error", "Fallo conexión"); }
    }
  };

  const logout = async () => { await auth.signOut(); };

  // --- RENDERIZADO ---
  if (view === 'create') return <CreateScreen onBack={() => setView('feed')} onCreate={handleCreateEvent} />;
  if (view === 'detail') {
      const eventToShow = events.find(e => e.id === selectedEventId);
      return <DetailScreen event={eventToShow} userEmail={currentUser.email} onBack={() => setView('feed')} onToggleRSVP={toggleRSVP} />;
  }
  if (view === 'profile') return <ProfileScreen user={currentUser} events={events} onBack={() => setView('feed')} onLogout={logout} onResetData={handleResetData} />;

  if (view === 'feed' && currentUser) {
      return (
        <View style={styles.container}>
            <View style={styles.backgroundDark} />
            <View style={[styles.blob, styles.blobGreen]} />
            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setView('profile')}>
                        <Text style={{color:'#10B981'}}>Hola,</Text>
                        <Text style={styles.headerTitle}>{currentUser.email.split('@')[0]}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setView('profile')} style={styles.avatar}><AntDesign name="user" size={20} color="#fff" /></TouchableOpacity>
                </View>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color="rgba(255,255,255,0.7)" style={{marginRight: 10}}/>
                    <TextInput placeholder="Buscar..." placeholderTextColor="rgba(255,255,255,0.5)" style={styles.searchInput}/>
                </View>
                <FlatList 
                    data={events} 
                    renderItem={({ item }) => <EventCard item={item} onPress={() => { setSelectedEventId(item.id); setView('detail'); }} onToggleLike={toggleLike} currentUserEmail={currentUser.email} />} 
                    keyExtractor={item => item.id} 
                    contentContainerStyle={{ paddingBottom: 100 }} 
                />
            </View>
            <TouchableOpacity style={styles.fab} onPress={() => setView('create')}><Ionicons name="add" size={30} color="white" /></TouchableOpacity>
        </View>
      );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.backgroundDark} />
      <View style={[styles.blob, styles.blobGreen]} />
      <View style={[styles.blob, styles.blobCyan]} />
      <LinearGradient colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']} style={styles.glassCard}>
        <Text style={styles.title}>{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</Text>
        <View style={styles.inputContainer}><TextInput style={styles.input} placeholder="Correo" placeholderTextColor="#aaa" value={email} onChangeText={setEmail}/></View>
        <View style={styles.inputContainer}><TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="#aaa" value={password} onChangeText={setPassword} secureTextEntry/></View>
        <TouchableOpacity style={styles.loginBtn} onPress={handleEmailAuth} disabled={loading}>{loading ? <ActivityIndicator color="white"/> : <Text style={styles.loginText}>{isRegistering?'Registrarse':'Ingresar'}</Text>}</TouchableOpacity>
        <View style={styles.separatorContainer}><View style={styles.separatorLine}/><Text style={{color:'#aaa', marginHorizontal:10}}>O</Text><View style={styles.separatorLine}/></View>
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('github')}><AntDesign name="github" size={24} color="white" /></TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('google')}><AntDesign name="google" size={24} color="white" /></TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)} style={{marginTop: 20}}><Text style={styles.toggleText}>{isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}</Text></TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  backgroundDark: { ...StyleSheet.absoluteFillObject, backgroundColor: '#1E1E1E' },
  contentContainer: { width: '100%', maxWidth: 500, height: '100%', paddingHorizontal: 20, paddingTop: 50 },
  blob: { position: 'absolute', width: 500, height: 500, borderRadius: 250, ...Platform.select({ web: { filter: 'blur(120px)' } }) },
  blobGreen: { backgroundColor: '#10B981', top: '10%', left: '20%', opacity: 0.4 },
  blobCyan: { backgroundColor: '#06B6D4', bottom: '10%', right: '20%', opacity: 0.4 },
  glassCard: { width: 380, padding: 30, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', ...Platform.select({ web: { backdropFilter: 'blur(25px)' } }) },
  title: { fontSize: 28, color: '#fff', marginBottom: 25, fontWeight: 'bold' },
  inputContainer: { width: '100%', height: 50, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 25, marginBottom: 15, justifyContent: 'center', borderWidth: 0 },
  input: { width: '100%', height: '100%', paddingHorizontal: 20, color: '#fff', textAlign: 'center' },
  loginBtn: { width: '100%', height: 50, backgroundColor: '#10B981', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 20, ...Platform.select({ web: { cursor: 'pointer' } }) },
  loginText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  separatorContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, width: '100%', justifyContent: 'center' },
  separatorLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  socialRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  socialBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', ...Platform.select({ web: { cursor: 'pointer', transition: '0.2s' } }) },
  toggleText: { color: 'rgba(255,255,255,0.7)', textDecorationLine: 'underline' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', ...Platform.select({ web: { cursor: 'pointer' } }) },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 25, paddingHorizontal: 15, height: 45, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchInput: { flex: 1, color: '#fff' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', ...Platform.select({ web: { backdropFilter: 'blur(10px)', cursor: 'pointer' } }) },
  cardImage: { width: 80, height: 80, borderRadius: 15, marginRight: 15 },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  cardMeta: { color: '#ccc', fontSize: 12, marginLeft: 6 },
  likeContainer: { alignItems: 'center', padding: 5, ...Platform.select({ web: { cursor: 'pointer' } }) },
  likeCount: { color: '#fff', fontSize: 10, marginTop: 2 },
  fab: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', elevation: 5, ...Platform.select({ web: { cursor: 'pointer' } }) },
  detailCard: { width: '100%', maxWidth: 500, padding: 25, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', ...Platform.select({ web: { backdropFilter: 'blur(25px)' } }) },
  detailImage: { width: '100%', height: 200, borderRadius: 20, marginBottom: 20 },
  detailTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  detailText: { color: '#ddd', fontSize: 16, marginLeft: 10 },
  descContainer: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 15, borderRadius: 15, marginTop: 20, marginBottom: 20 },
  descLabel: { color: '#10B981', fontWeight: 'bold', marginBottom: 5 },
  descText: { color: '#ccc', lineHeight: 22 },
  rsvpBtn: { width: '100%', height: 55, backgroundColor: '#10B981', borderRadius: 15, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', ...Platform.select({ web: { cursor: 'pointer' } }) },
  rsvpBtnActive: { backgroundColor: '#EF4444' },
  backBtn: { marginBottom: 20 },
  uploadBox: { width: '100%', height: 150, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  inputGlass: { width: '100%', height: 50, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 15, paddingHorizontal: 15, marginBottom: 15, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  attendingBadge: { position: 'absolute', top: -10, right: -10, backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, zIndex: 10 },
  attendingText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  profileAvatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent:'center', alignItems:'center', marginBottom: 10 },
  profileEmail: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  statBox: { width: '30%', padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statNumber: { color: '#10B981', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#ccc', fontSize: 12 },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 15, marginBottom: 10 },
  resetBtn: { flexDirection:'row', marginTop: 20, padding: 15, backgroundColor: '#EF4444', borderRadius: 15, justifyContent: 'center', alignItems: 'center', ...Platform.select({ web: { cursor: 'pointer' } }) },
});