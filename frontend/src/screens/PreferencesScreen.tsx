import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface Preferences {
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  propertyTypes?: string[];
  neighborhoods?: string[];
  minSqft?: number;
  maxSqft?: number;
  hasGarage?: boolean;
  hasPool?: boolean;
}

export default function PreferencesScreen() {
  const [preferences, setPreferences] = useState<Preferences>({});
  const [loading, setLoading] = useState(false);
  const { token, logout } = useAuth();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/preferences', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences || {});
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        Alert.alert('Success', 'Preferences saved successfully!');
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof Preferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const togglePropertyType = (type: string) => {
    const current = preferences.propertyTypes || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    updatePreference('propertyTypes', updated);
  };

  const formatPrice = (price?: number) => {
    if (!price) return '';
    return price.toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Preferences</Text>
          <Text style={styles.subtitle}>
            Set your ideal home criteria to get better matches
          </Text>
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Price Range</Text>
          <View style={styles.rangeContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Min Price</Text>
              <TextInput
                style={styles.input}
                placeholder="$250,000"
                value={preferences.minPrice ? formatPrice(preferences.minPrice) : ''}
                onChangeText={(text) => {
                  const num = parseInt(text.replace(/[^0-9]/g, ''));
                  updatePreference('minPrice', isNaN(num) ? undefined : num);
                }}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Max Price</Text>
              <TextInput
                style={styles.input}
                placeholder="$1,500,000"
                value={preferences.maxPrice ? formatPrice(preferences.maxPrice) : ''}
                onChangeText={(text) => {
                  const num = parseInt(text.replace(/[^0-9]/g, ''));
                  updatePreference('maxPrice', isNaN(num) ? undefined : num);
                }}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Bedrooms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛏️ Bedrooms</Text>
          <View style={styles.rangeContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Min Beds</Text>
              <TextInput
                style={styles.input}
                placeholder="2"
                value={preferences.minBeds?.toString() || ''}
                onChangeText={(text) => {
                  const num = parseInt(text);
                  updatePreference('minBeds', isNaN(num) ? undefined : num);
                }}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Max Beds</Text>
              <TextInput
                style={styles.input}
                placeholder="5"
                value={preferences.maxBeds?.toString() || ''}
                onChangeText={(text) => {
                  const num = parseInt(text);
                  updatePreference('maxBeds', isNaN(num) ? undefined : num);
                }}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Bathrooms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚿 Bathrooms</Text>
          <View style={styles.rangeContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Min Baths</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                value={preferences.minBaths?.toString() || ''}
                onChangeText={(text) => {
                  const num = parseInt(text);
                  updatePreference('minBaths', isNaN(num) ? undefined : num);
                }}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Max Baths</Text>
              <TextInput
                style={styles.input}
                placeholder="4"
                value={preferences.maxBaths?.toString() || ''}
                onChangeText={(text) => {
                  const num = parseInt(text);
                  updatePreference('maxBaths', isNaN(num) ? undefined : num);
                }}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Property Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 Property Types</Text>
          <View style={styles.propertyTypesContainer}>
            {['HOUSE', 'CONDO', 'TOWNHOME'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.propertyTypeButton,
                  (preferences.propertyTypes || []).includes(type) && styles.propertyTypeSelected,
                ]}
                onPress={() => togglePropertyType(type)}
              >
                <Text
                  style={[
                    styles.propertyTypeText,
                    (preferences.propertyTypes || []).includes(type) && styles.propertyTypeTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Square Footage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📏 Square Footage</Text>
          <View style={styles.rangeContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Min Sqft</Text>
              <TextInput
                style={styles.input}
                placeholder="900"
                value={preferences.minSqft?.toString() || ''}
                onChangeText={(text) => {
                  const num = parseInt(text);
                  updatePreference('minSqft', isNaN(num) ? undefined : num);
                }}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Max Sqft</Text>
              <TextInput
                style={styles.input}
                placeholder="4000"
                value={preferences.maxSqft?.toString() || ''}
                onChangeText={(text) => {
                  const num = parseInt(text);
                  updatePreference('maxSqft', isNaN(num) ? undefined : num);
                }}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Amenities</Text>
          <View style={styles.amenityContainer}>
            <View style={styles.amenityRow}>
              <Text style={styles.amenityLabel}>Must have garage</Text>
              <Switch
                value={preferences.hasGarage || false}
                onValueChange={(value) => updatePreference('hasGarage', value)}
                trackColor={{ false: '#ccc', true: '#ff6b6b' }}
                thumbColor="white"
              />
            </View>
            <View style={styles.amenityRow}>
              <Text style={styles.amenityLabel}>Must have pool</Text>
              <Switch
                value={preferences.hasPool || false}
                onValueChange={(value) => updatePreference('hasPool', value)}
                trackColor={{ false: '#ccc', true: '#ff6b6b' }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={savePreferences}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out" size={20} color="#ff6b6b" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  rangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  propertyTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  propertyTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  propertyTypeSelected: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff6b6b',
  },
  propertyTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  propertyTypeTextSelected: {
    color: 'white',
  },
  amenityContainer: {
    gap: 16,
  },
  amenityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amenityLabel: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#ff6b6b',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: '500',
  },
});
