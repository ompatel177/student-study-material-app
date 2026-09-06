import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../store/authStore';

interface HomeScreenProps {
  navigation: any;
}

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const BRANCHES = ['CSE', 'CE'];
const SEMESTERS = ['Semester 1', 'Semester 2'];

interface Subject {
  id: string;
  name: string;
  pdfUrl: string;
  fileName: string;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const user = useAuthStore((state) => state.user);
  const [selectedYear, setSelectedYear] = React.useState('1st Year');
  const [selectedBranch, setSelectedBranch] = React.useState('CSE');
  const [selectedSemester, setSelectedSemester] = React.useState('Semester 1');
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchSubjects();
  }, [selectedYear, selectedBranch, selectedSemester]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to Firebase/Backend
      const mockSubjects = [
        {
          id: '1',
          name: 'Data Structures',
          pdfUrl: 'https://example.com/ds.pdf',
          fileName: 'Data_Structures.pdf',
        },
        {
          id: '2',
          name: 'Algorithms',
          pdfUrl: 'https://example.com/algo.pdf',
          fileName: 'Algorithms.pdf',
        },
        {
          id: '3',
          name: 'Database Management',
          pdfUrl: 'https://example.com/dbms.pdf',
          fileName: 'DBMS.pdf',
        },
      ];
      setSubjects(mockSubjects);
    } catch (error) {
      console.error('Fetch subjects error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectPress = (subject: Subject) => {
    navigation.navigate('PDFViewer', { subject });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome, {user?.name?.split(' ')[0]}!</Text>
            <Text style={styles.subText}>Browse your study materials</Text>
          </View>
          <Icon name="school" size={40} color="#2563eb" />
        </View>

        {/* Year Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Year</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {YEARS.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.filterButton,
                  selectedYear === year && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedYear(year)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedYear === year && styles.filterButtonTextActive,
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Branch Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Branch</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {BRANCHES.map((branch) => (
              <TouchableOpacity
                key={branch}
                style={[
                  styles.filterButton,
                  selectedBranch === branch && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedBranch(branch)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedBranch === branch && styles.filterButtonTextActive,
                  ]}
                >
                  {branch}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Semester Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Semester</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {SEMESTERS.map((semester) => (
              <TouchableOpacity
                key={semester}
                style={[
                  styles.filterButton,
                  selectedSemester === semester && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedSemester(semester)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedSemester === semester && styles.filterButtonTextActive,
                  ]}
                >
                  {semester}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Subjects List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subjects</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
          ) : subjects.length > 0 ? (
            <View style={styles.subjectsList}>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={styles.subjectCard}
                  onPress={() => handleSubjectPress(subject)}
                >
                  <View style={styles.subjectIcon}>
                    <Icon name="picture-as-pdf" size={32} color="#ff6b6b" />
                  </View>
                  <View style={styles.subjectInfo}>
                    <Text style={styles.subjectName}>{subject.name}</Text>
                    <Text style={styles.subjectFile}>{subject.fileName}</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="folder-open" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No materials available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  filterScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  loader: {
    marginVertical: 20,
  },
  subjectsList: {
    gap: 12,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  subjectIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#fff0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  subjectFile: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
});
