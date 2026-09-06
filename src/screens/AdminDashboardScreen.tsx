import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';
import { useAuthStore } from '../store/authStore';

interface AdminDashboardScreenProps {
  navigation: any;
}

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const BRANCHES = ['CSE', 'CE'];
const SEMESTERS = ['Semester 1', 'Semester 2'];

export default function AdminDashboardScreen({ navigation }: AdminDashboardScreenProps) {
  const { logout } = useAuthStore();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedYear, setSelectedYear] = React.useState('1st Year');
  const [selectedBranch, setSelectedBranch] = React.useState('CSE');
  const [selectedSemester, setSelectedSemester] = React.useState('Semester 1');
  const [subjectName, setSubjectName] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<any>(null);
  const [uploading, setUploading] = React.useState(false);
  const [materials, setMaterials] = React.useState<any[]>([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUploadMaterial = async () => {
    if (!subjectName.trim()) {
      Alert.alert('Error', 'Please enter subject name');
      return;
    }

    if (!selectedFile) {
      Alert.alert('Error', 'Please select a PDF file');
      return;
    }

    setUploading(true);
    try {
      // TODO: Replace with actual Firebase upload
      const newMaterial = {
        id: Date.now().toString(),
        name: subjectName,
        year: selectedYear,
        branch: selectedBranch,
        semester: selectedSemester,
        fileName: selectedFile.name,
        uploadedAt: new Date().toLocaleDateString(),
      };

      setMaterials([...materials, newMaterial]);
      Alert.alert('Success', 'Material uploaded successfully');
      
      // Reset form
      setSubjectName('');
      setSelectedFile(null);
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const handleEditMaterial = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveEdit = (id: string) => {
    setMaterials(
      materials.map((m) =>
        m.id === id ? { ...m, name: editName } : m
      )
    );
    setEditingId(null);
    setEditName('');
    Alert.alert('Success', 'Material updated successfully');
  };

  const handleDeleteMaterial = (id: string) => {
    Alert.alert(
      'Delete Material',
      'Are you sure you want to delete this material?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: () => {
            setMaterials(materials.filter((m) => m.id !== id));
            Alert.alert('Success', 'Material deleted successfully');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Logout',
          onPress: () => logout(),
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>Manage study materials</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard icon="folder" label="Total Materials" value={materials.length.toString()} />
          <StatCard icon="groups" label="Branches" value="2" />
          <StatCard icon="school" label="Years" value="4" />
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="cloud-upload" size={24} color="white" />
          <Text style={styles.uploadButtonText}>Upload New Material</Text>
        </TouchableOpacity>

        {/* Materials List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uploaded Materials</Text>
          {materials.length > 0 ? (
            <View style={styles.materialsList}>
              {materials.map((material) => (
                <View key={material.id} style={styles.materialCard}>
                  <View style={styles.materialIcon}>
                    <Icon name="picture-as-pdf" size={28} color="#ff6b6b" />
                  </View>
                  <View style={styles.materialInfo}>
                    {editingId === material.id ? (
                      <View style={styles.editContainer}>
                        <TextInput
                          style={styles.editInput}
                          value={editName}
                          onChangeText={setEditName}
                          placeholder="Subject name"
                        />
                        <TouchableOpacity
                          onPress={() => handleSaveEdit(material.id)}
                          style={styles.saveButton}
                        >
                          <Icon name="check" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <>
                        <Text style={styles.materialName}>{material.name}</Text>
                        <Text style={styles.materialMeta}>
                          {material.branch} • {material.year} • {material.semester}
                        </Text>
                        <Text style={styles.materialDate}>{material.uploadedAt}</Text>
                      </>
                    )}
                  </View>
                  {editingId !== material.id && (
                    <View style={styles.actions}>
                      <TouchableOpacity
                        onPress={() => handleEditMaterial(material.id, material.name)}
                        style={styles.actionButton}
                      >
                        <Icon name="edit" size={18} color="#2563eb" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteMaterial(material.id)}
                        style={styles.actionButton}
                      >
                        <Icon name="delete" size={18} color="#ff6b6b" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="folder-open" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No materials uploaded yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Study Material</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Subject Name */}
              <Text style={styles.label}>Subject Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Data Structures"
                value={subjectName}
                onChangeText={setSubjectName}
                editable={!uploading}
              />

              {/* Year Selection */}
              <Text style={styles.label}>Year</Text>
              <View style={styles.filterRow}>
                {YEARS.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.filterChip,
                      selectedYear === year && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedYear === year && styles.filterChipTextActive,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Branch Selection */}
              <Text style={styles.label}>Branch</Text>
              <View style={styles.filterRow}>
                {BRANCHES.map((branch) => (
                  <TouchableOpacity
                    key={branch}
                    style={[
                      styles.filterChip,
                      selectedBranch === branch && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedBranch(branch)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedBranch === branch && styles.filterChipTextActive,
                      ]}
                    >
                      {branch}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Semester Selection */}
              <Text style={styles.label}>Semester</Text>
              <View style={styles.filterRow}>
                {SEMESTERS.map((semester) => (
                  <TouchableOpacity
                    key={semester}
                    style={[
                      styles.filterChip,
                      selectedSemester === semester && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedSemester(semester)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedSemester === semester && styles.filterChipTextActive,
                      ]}
                    >
                      {semester}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* File Selection */}
              <Text style={styles.label}>Select PDF File</Text>
              <TouchableOpacity
                style={styles.filePickerButton}
                onPress={handlePickDocument}
                disabled={uploading}
              >
                <Icon name="attach-file" size={24} color="#2563eb" />
                <Text style={styles.filePickerText}>
                  {selectedFile ? selectedFile.name : 'Choose PDF file'}
                </Text>
              </TouchableOpacity>

              {selectedFile && (
                <Text style={styles.selectedFile}>✓ {selectedFile.name}</Text>
              )}
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                disabled={uploading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
                onPress={handleUploadMaterial}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Icon name="cloud-upload" size={18} color="white" />
                    <Text style={styles.submitButtonText}>Upload</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Icon name={icon} size={32} color="#2563eb" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  uploadButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  materialsList: {
    gap: 12,
  },
  materialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  materialIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#fff0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  materialMeta: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  materialDate: {
    fontSize: 11,
    color: '#ccc',
    marginTop: 2,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    width: 32,
    height: 32,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: 'white',
  },
  filePickerButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  filePickerText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedFile: {
    marginTop: 8,
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
