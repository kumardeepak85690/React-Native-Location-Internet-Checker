// LocationInternetChecker.jsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Button,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';

import NetInfo from '@react-native-community/netinfo';
import Geolocation from '@react-native-community/geolocation';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const App = () => {
  const [internetOn, setInternetOn] = useState(false);
  const [locationOn, setLocationOn] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    checkAll();

    const unsubscribe = NetInfo.addEventListener(() => {
      checkAll();
    });

    return () => unsubscribe();
  }, []);

  const checkAll = async () => {
    const net = await NetInfo.fetch();

    const hasInternet = net.isConnected && net.isInternetReachable !== false;
    setInternetOn(hasInternet);

    const hasLocation = await checkLocation();
    setLocationOn(hasLocation);

    if (!hasInternet || !hasLocation) {
      setModalVisible(true);
      setLocation(null);
    } else {
      setModalVisible(false);
      getLocation();
    }
  };

  const checkLocation = async () => {
    const permission =
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    let status = await check(permission);

    if (status === RESULTS.DENIED) {
      status = await request(permission);
    }

    if (status !== RESULTS.GRANTED) {
      return false;
    }

    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        },
      );
    });
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation(position.coords);
      },
      error => {
        console.log('Location error:', error);
        setLocationOn(false);
        setModalVisible(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  const openInternetSettings = () => {
    if (Platform.OS === 'android') {
      Linking.sendIntent('android.settings.WIFI_SETTINGS');
    } else {
      Linking.openSettings();
    }
  };

  const openLocationSettings = () => {
    if (Platform.OS === 'android') {
      Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location & Internet Checker</Text>

      {location ? (
        <View style={styles.card}>
          <Text>Internet: Connected</Text>
          <Text>Location: Enabled</Text>
          <Text>Latitude: {location.latitude}</Text>
          <Text>Longitude: {location.longitude}</Text>
          <Text>Accuracy: {location.accuracy} meters</Text>
        </View>
      ) : (
        <Text>Checking location and internet...</Text>
      )}

      <Button title="Check Again" onPress={checkAll} />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalWrapper}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Required Settings Off</Text>

            {!internetOn && (
              <>
                <Text style={styles.message}>
                  Internet connection is off. Please turn it on.
                </Text>
                <Button
                  title="Open Internet Settings"
                  onPress={openInternetSettings}
                />
              </>
            )}

            {!locationOn && (
              <>
                <Text style={styles.message}>
                  Location service is off or permission is not allowed.
                </Text>
                <Button
                  title="Open Location Settings"
                  onPress={openLocationSettings}
                />
              </>
            )}

            <View style={{ marginTop: 15 }}>
              <Button title="Check Again" onPress={checkAll} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    marginBottom: 20,
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  message: {
    marginVertical: 10,
    fontSize: 15,
  },
});
