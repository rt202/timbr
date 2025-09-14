import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface House {
  id: string;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSqft?: number;
  yearBuilt?: number;
  propertyType: string;
  addressLine1: string;
  city: string;
  state: string;
  hasGarage: boolean;
  hasPool: boolean;
  hoaMonthly?: number;
  images: { url: string; caption?: string }[];
  agent?: {
    user: { displayName: string };
    rating?: number;
    brokerage?: string;
  };
  seller?: {
    user: { displayName: string };
  };
}

interface HouseCardProps {
  house: House;
}

export default function HouseCard({ house }: HouseCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const nextImage = () => {
    setCurrentImageIndex((current) =>
      current === house.images.length - 1 ? 0 : current + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((current) =>
      current === 0 ? house.images.length - 1 : current - 1
    );
  };

  return (
    <View style={styles.container}>
      {/* Image carousel */}
      <View style={styles.imageContainer}>
        {house.images.length > 0 ? (
          <>
            <Image
              source={{ uri: house.images[currentImageIndex].url }}
              style={styles.image}
              resizeMode="cover"
            />
            
            {/* Image navigation */}
            {house.images.length > 1 && (
              <>
                <TouchableOpacity style={styles.imageNavLeft} onPress={prevImage}>
                  <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageNavRight} onPress={nextImage}>
                  <Ionicons name="chevron-forward" size={24} color="white" />
                </TouchableOpacity>
                
                {/* Image indicators */}
                <View style={styles.imageIndicators}>
                  {house.images.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.indicator,
                        index === currentImageIndex && styles.activeIndicator,
                      ]}
                    />
                  ))}
                </View>
              </>
            )}

            {/* Price overlay */}
            <View style={styles.priceOverlay}>
              <Text style={styles.price}>{formatPrice(house.price)}</Text>
            </View>
          </>
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="home" size={60} color="#ccc" />
            <Text style={styles.noImageText}>No photos available</Text>
          </View>
        )}
      </View>

      {/* House details */}
      <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{house.title}</Text>
        
        <View style={styles.addressContainer}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.address}>
            {house.addressLine1}, {house.city}, {house.state}
          </Text>
        </View>

        {/* Key stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="bed" size={20} color="#ff6b6b" />
            <Text style={styles.statText}>{house.bedrooms} bed</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="water" size={20} color="#ff6b6b" />
            <Text style={styles.statText}>{house.bathrooms} bath</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="resize" size={20} color="#ff6b6b" />
            <Text style={styles.statText}>{formatNumber(house.sqft)} sqft</Text>
          </View>
        </View>

        {/* Property details */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Property Type</Text>
            <Text style={styles.detailValue}>{house.propertyType}</Text>
          </View>
          
          {house.yearBuilt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Year Built</Text>
              <Text style={styles.detailValue}>{house.yearBuilt}</Text>
            </View>
          )}
          
          {house.lotSqft && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Lot Size</Text>
              <Text style={styles.detailValue}>{formatNumber(house.lotSqft)} sqft</Text>
            </View>
          )}
          
          {house.hoaMonthly && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>HOA Monthly</Text>
              <Text style={styles.detailValue}>${house.hoaMonthly}</Text>
            </View>
          )}
        </View>

        {/* Amenities */}
        {(house.hasGarage || house.hasPool) && (
          <View style={styles.amenitiesContainer}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesList}>
              {house.hasGarage && (
                <View style={styles.amenityItem}>
                  <Ionicons name="car" size={16} color="#4CAF50" />
                  <Text style={styles.amenityText}>Garage</Text>
                </View>
              )}
              {house.hasPool && (
                <View style={styles.amenityItem}>
                  <Ionicons name="water" size={16} color="#4CAF50" />
                  <Text style={styles.amenityText}>Pool</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{house.description}</Text>
        </View>

        {/* Agent/Seller info */}
        {(house.agent || house.seller) && (
          <View style={styles.contactContainer}>
            <Text style={styles.sectionTitle}>Listed by</Text>
            {house.agent ? (
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{house.agent.user.displayName}</Text>
                <Text style={styles.agentTitle}>Real Estate Agent</Text>
                {house.agent.brokerage && (
                  <Text style={styles.agentBrokerage}>{house.agent.brokerage}</Text>
                )}
                {house.agent.rating && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.rating}>{house.agent.rating.toFixed(1)}</Text>
                  </View>
                )}
              </View>
            ) : house.seller && (
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{house.seller.user.displayName}</Text>
                <Text style={styles.sellerTitle}>Owner</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  noImageText: {
    marginTop: 8,
    color: '#999',
    fontSize: 16,
  },
  imageNavLeft: {
    position: 'absolute',
    left: 10,
    top: '50%',
    marginTop: -20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageNavRight: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  priceOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  price: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  address: {
    marginLeft: 4,
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailsGrid: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  amenitiesContainer: {
    marginBottom: 20,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  amenityText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  contactContainer: {
    marginBottom: 20,
  },
  agentInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  agentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  agentTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  agentBrokerage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sellerInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sellerTitle: {
    fontSize: 14,
    color: '#666',
  },
});
