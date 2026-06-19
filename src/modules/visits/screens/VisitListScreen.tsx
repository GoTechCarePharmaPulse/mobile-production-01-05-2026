import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import RoleGuard from '@/src/guards/RoleGuard';
import { visitService } from '@/src/modules/visits/api/visitService';
import type { Visit } from '@/src/types/visit';

export default function VisitListScreen() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'STARTED' | 'VISITED' | 'COMPLETED'>('ALL');
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: visitsData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['visits', selectedDate],
    queryFn: () =>
      visitService.getMyVisits({
        date: selectedDate,
        status: filterStatus === 'ALL' ? undefined : filterStatus,
      }),
  });

  const visits = visitsData || [];

  const filteredVisits = visits.filter((visit) => {
    if (searchText.trim()) {
      // Filter by doctor name or clinic name (would need to fetch doctor details)
      return visit.notes?.toLowerCase().includes(searchText.toLowerCase());
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'STARTED':
        return { bg: '#dbeafe', text: '#0369a1', label: 'In Clinic' };
      case 'VISITED':
        return { bg: '#fef3c7', text: '#92400e', label: 'Visited' };
      case 'COMPLETED':
        return { bg: '#dcfce7', text: '#166534', label: 'Completed' };
      default:
        return { bg: '#f1f5f9', text: '#64748b', label: status };
    }
  };

  const getElapsedTime = (startTime: string | Date) => {
    const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000);
    if (elapsed < 60) return `${elapsed}m ago`;
    const hours = Math.floor(elapsed / 60);
    return `${hours}h ago`;
  };

  const renderVisitCard = ({ item: visit }: { item: Visit }) => {
    const statusInfo = getStatusColor(visit.status);

    return (
      <TouchableOpacity
        style={styles.visitCard}
        onPress={() => {
          if (visit.status === 'STARTED') {
            router.push(`/crm/active-visit/${visit._id}` as any);
          }
        }}
      >
        <View style={styles.visitHeader}>
          <View style={styles.visitTitle}>
            <Text style={styles.visitTime}>
              {visit.startTime
                ? new Date(visit.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'N/A'}
            </Text>
            <Text style={styles.visitElapsed}>
              {visit.startTime ? getElapsedTime(visit.startTime) : ''}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.text }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {visit.notes && (
          <View style={styles.visitNotes}>
            <Ionicons name="document-text" size={14} color="#64748b" />
            <Text style={styles.notesText} numberOfLines={2}>
              {visit.notes}
            </Text>
          </View>
        )}

        <View style={styles.visitMeta}>
          {visit.productsDiscussed && visit.productsDiscussed.length > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="cube" size={14} color="#5b66d6" />
              <Text style={styles.metaText}>
                {visit.productsDiscussed.length} products
              </Text>
            </View>
          )}
          {visit.followUpDate && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={14} color="#5b66d6" />
              <Text style={styles.metaText}>
                {new Date(visit.followUpDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {visit.status === 'STARTED' && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push(`/crm/active-visit/${visit._id}` as any)}
          >
            <Text style={styles.continueButtonText}>Continue Visit</Text>
            <Ionicons name="arrow-forward" size={14} color="#5b66d6" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Image
        source={require('@/src/assets/branding/empty_state_placeholder.png')}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyTitle}>No Visits</Text>
      <Text style={styles.emptyDescription}>
        {searchText
          ? 'No visits match your search'
          : `No visits recorded for ${selectedDate}`}
      </Text>
      <TouchableOpacity
        style={styles.startVisitButton}
        onPress={() => router.push('/crm/start-visit' as any)}
      >
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.startVisitButtonText}>Start New Visit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <RoleGuard requiredRole="mr">
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Field Activity</Text>
            <Text style={styles.title}>Visit Logs</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/crm/start-visit' as any)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {(['ALL', 'STARTED', 'VISITED', 'COMPLETED'] as const).map(
              (status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    filterStatus === status && styles.filterChipActive,
                  ]}
                  onPress={() => setFilterStatus(status)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterStatus === status && styles.filterChipTextActive,
                    ]}
                  >
                    {status === 'ALL' ? 'All Visits' : status}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={18}
            color="#94a3b8"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search visits..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#cbd5e1"
          />
        </View>

        <View style={styles.dateContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 1);
              setSelectedDate(newDate.toISOString().slice(0, 10));
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#5b66d6" />
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 1);
              if (newDate <= new Date()) {
                setSelectedDate(newDate.toISOString().slice(0, 10));
              }
            }}
          >
            <Ionicons name="chevron-forward" size={20} color="#5b66d6" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredVisits}
          renderItem={renderVisitCard}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
            />
          }
        />
      </View>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  eyebrow: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5b66d6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterChip: {
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#5b66d6',
    borderColor: '#5b66d6',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    paddingVertical: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  dateButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  visitCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 12,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  visitTitle: {
    flex: 1,
  },
  visitTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  visitElapsed: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  visitNotes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: '#64748b',
  },
  visitMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#5b66d6',
    fontWeight: '500',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4ff',
    borderRadius: 6,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#5b66d6',
  },
  continueButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5b66d6',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
    textAlign: 'center',
  },
  startVisitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5b66d6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  startVisitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
