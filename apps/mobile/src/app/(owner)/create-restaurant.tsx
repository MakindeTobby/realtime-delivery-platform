import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CreateRestaurant() {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Restaurant</Text>
          <Text style={styles.subtitle}>
            Add your restaurant details to get started.
          </Text>
        </View>

        {/* Restaurant Image */}
        <View style={styles.imageSection}>
          <Pressable style={styles.imagePicker}>
            <Text style={styles.imageIcon}>＋</Text>
            <Text style={styles.imageText}>Add restaurant photo</Text>
            <Text style={styles.imageHint}>Optional</Text>
          </Pressable>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic information</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Restaurant name</Text>
            <TextInput
              placeholder="e.g. Tasty Bites"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              placeholder="Tell customers a little about your restaurant..."
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.textarea]}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              placeholder="Enter restaurant address"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>City</Text>
              <TextInput
                placeholder="Ibadan"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>

            <View style={styles.halfField}>
              <Text style={styles.label}>State</Text>
              <TextInput
                placeholder="Oyo"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Phone number</Text>
            <TextInput
              placeholder="+234 800 000 0000"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="restaurant@example.com"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Submit */}
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Create Restaurant</Text>
        </Pressable>

        <Text style={styles.footerText}>
          You can update these details later.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
  },

  imageSection: {
    marginBottom: 28,
  },

  imagePicker: {
    height: 150,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },

  imageIcon: {
    fontSize: 28,
    color: "#6B7280",
    marginBottom: 6,
  },

  imageText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },

  imageHint: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 3,
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  field: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },

  textarea: {
    height: 110,
    paddingTop: 14,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  halfField: {
    flex: 1,
  },

  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  footerText: {
    textAlign: "center",
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 12,
  },
});
