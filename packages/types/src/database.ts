/**
 * GERADO AUTOMATICAMENTE A PARTIR DO SCHEMA DO SUPABASE — NAO EDITAR A MAO.
 *
 * Regenerar com:  pnpm gen:types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_validations: {
        Row: {
          checkin_id: string
          completion_tokens: number | null
          confidence: number | null
          cost_cents: number | null
          created_at: string
          extracted_responses: Json | null
          id: string
          missing_items: Json | null
          model: string | null
          prompt_tokens: number | null
          provider: string | null
          status: Database["public"]["Enums"]["validation_status"]
          tenant_id: string
          transcript_id: string | null
          updated_at: string
        }
        Insert: {
          checkin_id: string
          completion_tokens?: number | null
          confidence?: number | null
          cost_cents?: number | null
          created_at?: string
          extracted_responses?: Json | null
          id?: string
          missing_items?: Json | null
          model?: string | null
          prompt_tokens?: number | null
          provider?: string | null
          status?: Database["public"]["Enums"]["validation_status"]
          tenant_id: string
          transcript_id?: string | null
          updated_at?: string
        }
        Update: {
          checkin_id?: string
          completion_tokens?: number | null
          confidence?: number | null
          cost_cents?: number | null
          created_at?: string
          extracted_responses?: Json | null
          id?: string
          missing_items?: Json | null
          model?: string | null
          prompt_tokens?: number | null
          provider?: string | null
          status?: Database["public"]["Enums"]["validation_status"]
          tenant_id?: string
          transcript_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_validations_checkin_id_fkey"
            columns: ["checkin_id"]
            isOneToOne: false
            referencedRelation: "checkins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_validations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_validations_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "audio_transcriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_transcriptions: {
        Row: {
          confidence: number | null
          cost_cents: number | null
          created_at: string
          error_message: string | null
          id: string
          language: string | null
          media_file_id: string
          model: string | null
          processing_time_ms: number | null
          provider: string | null
          status: Database["public"]["Enums"]["transcription_status"]
          tenant_id: string
          transcript: string | null
          updated_at: string
        }
        Insert: {
          confidence?: number | null
          cost_cents?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          language?: string | null
          media_file_id: string
          model?: string | null
          processing_time_ms?: number | null
          provider?: string | null
          status?: Database["public"]["Enums"]["transcription_status"]
          tenant_id: string
          transcript?: string | null
          updated_at?: string
        }
        Update: {
          confidence?: number | null
          cost_cents?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          language?: string | null
          media_file_id?: string
          model?: string | null
          processing_time_ms?: number | null
          provider?: string | null
          status?: Database["public"]["Enums"]["transcription_status"]
          tenant_id?: string
          transcript?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_transcriptions_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_transcriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          tenant_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          tenant_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          tenant_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          app_version: string | null
          checklist_responses: Json
          checklist_template_id: string | null
          client_created_at: string | null
          corrects_id: string | null
          device_id: string | null
          geo_accuracy_m: number | null
          geo_within_post: boolean | null
          id: string
          latitude: number | null
          longitude: number | null
          post_id: string
          purpose: Database["public"]["Enums"]["checkin_purpose"]
          schedule_id: string | null
          selfie_storage_path: string | null
          server_received_at: string
          tenant_id: string
          unscheduled: boolean
          user_id: string
        }
        Insert: {
          app_version?: string | null
          checklist_responses?: Json
          checklist_template_id?: string | null
          client_created_at?: string | null
          corrects_id?: string | null
          device_id?: string | null
          geo_accuracy_m?: number | null
          geo_within_post?: boolean | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          post_id: string
          purpose: Database["public"]["Enums"]["checkin_purpose"]
          schedule_id?: string | null
          selfie_storage_path?: string | null
          server_received_at?: string
          tenant_id: string
          unscheduled?: boolean
          user_id: string
        }
        Update: {
          app_version?: string | null
          checklist_responses?: Json
          checklist_template_id?: string | null
          client_created_at?: string | null
          corrects_id?: string | null
          device_id?: string | null
          geo_accuracy_m?: number | null
          geo_within_post?: boolean | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          post_id?: string
          purpose?: Database["public"]["Enums"]["checkin_purpose"]
          schedule_id?: string | null
          selfie_storage_path?: string | null
          server_received_at?: string
          tenant_id?: string
          unscheduled?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_checklist_template_id_fkey"
            columns: ["checklist_template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_corrects_id_fkey"
            columns: ["corrects_id"]
            isOneToOne: false
            referencedRelation: "checkins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          active: boolean
          created_at: string
          deleted_at: string | null
          id: string
          items: Json
          name: string
          service_type: Database["public"]["Enums"]["post_service_type"] | null
          tenant_id: string
          updated_at: string
          version: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          deleted_at?: string | null
          id?: string
          items?: Json
          name: string
          service_type?: Database["public"]["Enums"]["post_service_type"] | null
          tenant_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          deleted_at?: string | null
          id?: string
          items?: Json
          name?: string
          service_type?: Database["public"]["Enums"]["post_service_type"] | null
          tenant_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "checklist_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          cnpj: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          notes: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          notes?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_categories: {
        Row: {
          active: boolean
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          notify_supervisor: boolean
          severity_default: Database["public"]["Enums"]["incident_severity"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          notify_supervisor?: boolean
          severity_default?: Database["public"]["Enums"]["incident_severity"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          notify_supervisor?: boolean
          severity_default?: Database["public"]["Enums"]["incident_severity"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_status_changes: {
        Row: {
          changed_by: string
          comment: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["incident_status"] | null
          id: string
          incident_id: string
          tenant_id: string
          to_status: Database["public"]["Enums"]["incident_status"]
        }
        Insert: {
          changed_by: string
          comment?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["incident_status"] | null
          id?: string
          incident_id: string
          tenant_id: string
          to_status: Database["public"]["Enums"]["incident_status"]
        }
        Update: {
          changed_by?: string
          comment?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["incident_status"] | null
          id?: string
          incident_id?: string
          tenant_id?: string
          to_status?: Database["public"]["Enums"]["incident_status"]
        }
        Relationships: [
          {
            foreignKeyName: "incident_status_changes_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_status_changes_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_status_changes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          client_created_at: string | null
          corrects_id: string | null
          description: string | null
          id: string
          incident_category_id: string | null
          latitude: number | null
          longitude: number | null
          post_id: string
          server_received_at: string
          severity: Database["public"]["Enums"]["incident_severity"]
          status: Database["public"]["Enums"]["incident_status"]
          tenant_id: string
          title: string
          user_id: string
        }
        Insert: {
          client_created_at?: string | null
          corrects_id?: string | null
          description?: string | null
          id?: string
          incident_category_id?: string | null
          latitude?: number | null
          longitude?: number | null
          post_id: string
          server_received_at?: string
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          tenant_id: string
          title: string
          user_id: string
        }
        Update: {
          client_created_at?: string | null
          corrects_id?: string | null
          description?: string | null
          id?: string
          incident_category_id?: string | null
          latitude?: number | null
          longitude?: number | null
          post_id?: string
          server_received_at?: string
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          tenant_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_corrects_id_fkey"
            columns: ["corrects_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_incident_category_id_fkey"
            columns: ["incident_category_id"]
            isOneToOne: false
            referencedRelation: "incident_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      media_files: {
        Row: {
          audio_expires_at: string | null
          audio_purged: boolean
          created_at: string
          duration_ms: number | null
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
          linked_entity_id: string | null
          linked_entity_type: string | null
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          tenant_id: string
          uploaded_by: string | null
        }
        Insert: {
          audio_expires_at?: string | null
          audio_purged?: boolean
          created_at?: string
          duration_ms?: number | null
          id?: string
          kind: Database["public"]["Enums"]["media_kind"]
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          tenant_id: string
          uploaded_by?: string | null
        }
        Update: {
          audio_expires_at?: string | null
          audio_purged?: boolean
          created_at?: string
          duration_ms?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          tenant_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_files_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          delivery_status: string | null
          id: string
          kind: string | null
          payload: Json | null
          recipient_user_id: string
          tenant_id: string
          title: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          delivery_status?: string | null
          id?: string
          kind?: string | null
          payload?: Json | null
          recipient_user_id: string
          tenant_id: string
          title?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          delivery_status?: string | null
          id?: string
          kind?: string | null
          payload?: Json | null
          recipient_user_id?: string
          tenant_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      periodic_checkin_expectations: {
        Row: {
          created_at: string
          escalated_at: string | null
          expected_at: string
          fulfilled_by_checkin_id: string | null
          id: string
          post_id: string
          schedule_id: string
          tenant_id: string
          window_min: number
        }
        Insert: {
          created_at?: string
          escalated_at?: string | null
          expected_at: string
          fulfilled_by_checkin_id?: string | null
          id?: string
          post_id: string
          schedule_id: string
          tenant_id: string
          window_min?: number
        }
        Update: {
          created_at?: string
          escalated_at?: string | null
          expected_at?: string
          fulfilled_by_checkin_id?: string | null
          id?: string
          post_id?: string
          schedule_id?: string
          tenant_id?: string
          window_min?: number
        }
        Relationships: [
          {
            foreignKeyName: "periodic_checkin_expectations_fulfilled_by_checkin_id_fkey"
            columns: ["fulfilled_by_checkin_id"]
            isOneToOne: false
            referencedRelation: "checkins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "periodic_checkin_expectations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "periodic_checkin_expectations_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "periodic_checkin_expectations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      post_checklist_assignments: {
        Row: {
          checklist_template_id: string
          created_at: string
          id: string
          post_id: string
          purpose: Database["public"]["Enums"]["checklist_purpose"]
          shift_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          checklist_template_id: string
          created_at?: string
          id?: string
          post_id: string
          purpose: Database["public"]["Enums"]["checklist_purpose"]
          shift_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          checklist_template_id?: string
          created_at?: string
          id?: string
          post_id?: string
          purpose?: Database["public"]["Enums"]["checklist_purpose"]
          shift_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_checklist_assignments_checklist_template_id_fkey"
            columns: ["checklist_template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_checklist_assignments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_checklist_assignments_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_checklist_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          active: boolean
          address: string | null
          client_id: string
          created_at: string
          deleted_at: string | null
          geofence_radius_m: number
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          qr_code_rotated_at: string | null
          qr_code_token: string
          service_type: Database["public"]["Enums"]["post_service_type"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          client_id: string
          created_at?: string
          deleted_at?: string | null
          geofence_radius_m?: number
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          qr_code_rotated_at?: string | null
          qr_code_token: string
          service_type: Database["public"]["Enums"]["post_service_type"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          client_id?: string
          created_at?: string
          deleted_at?: string | null
          geofence_radius_m?: number
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          qr_code_rotated_at?: string | null
          qr_code_token?: string
          service_type?: Database["public"]["Enums"]["post_service_type"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          active: boolean
          created_at: string
          device_id: string | null
          expo_push_token: string
          id: string
          platform: string | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          device_id?: string | null
          expo_push_token: string
          id?: string
          platform?: string | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          device_id?: string | null
          expo_push_token?: string
          id?: string
          platform?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          post_id: string
          scheduled_date: string
          shift_id: string
          status: Database["public"]["Enums"]["schedule_status"]
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          post_id: string
          scheduled_date: string
          shift_id: string
          status?: Database["public"]["Enums"]["schedule_status"]
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          post_id?: string
          scheduled_date?: string
          shift_id?: string
          status?: Database["public"]["Enums"]["schedule_status"]
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          created_at: string
          deleted_at: string | null
          end_time: string
          id: string
          name: string | null
          periodic_checkin_interval_min: number
          post_id: string
          start_time: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          end_time: string
          id?: string
          name?: string | null
          periodic_checkin_interval_min?: number
          post_id: string
          start_time: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          end_time?: string
          id?: string
          name?: string | null
          periodic_checkin_interval_min?: number
          post_id?: string
          start_time?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          cnpj: string | null
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          slug: string
          timezone: string
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          slug: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          slug?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string | null
          employee_code: string | null
          full_name: string
          id: string
          last_pin_failed_at: string | null
          phone: string | null
          pin_failed_count: number
          pin_hash: string | null
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          employee_code?: string | null
          full_name: string
          id: string
          last_pin_failed_at?: string | null
          phone?: string | null
          pin_failed_count?: number
          pin_hash?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          employee_code?: string | null
          full_name?: string
          id?: string
          last_pin_failed_at?: string | null
          phone?: string | null
          pin_failed_count?: number
          pin_hash?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_tenant_id: { Args: never; Returns: string }
      current_user_role: { Args: never; Returns: string }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      uuid_generate_v7: { Args: never; Returns: string }
    }
    Enums: {
      checkin_purpose: "entry" | "periodic" | "exit"
      checklist_purpose: "entry" | "periodic" | "exit"
      incident_severity: "low" | "medium" | "high" | "critical"
      incident_status: "open" | "acknowledged" | "resolved" | "dismissed"
      media_kind: "audio" | "photo"
      post_service_type:
        | "portaria"
        | "servicos_gerais"
        | "tecnico"
        | "monitoramento"
      schedule_status: "planned" | "confirmed" | "replaced" | "cancelled"
      transcription_status: "pending" | "processing" | "completed" | "failed"
      user_role: "admin" | "supervisor" | "field_worker"
      validation_status: "pending" | "completed" | "failed" | "manual_override"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      checkin_purpose: ["entry", "periodic", "exit"],
      checklist_purpose: ["entry", "periodic", "exit"],
      incident_severity: ["low", "medium", "high", "critical"],
      incident_status: ["open", "acknowledged", "resolved", "dismissed"],
      media_kind: ["audio", "photo"],
      post_service_type: [
        "portaria",
        "servicos_gerais",
        "tecnico",
        "monitoramento",
      ],
      schedule_status: ["planned", "confirmed", "replaced", "cancelled"],
      transcription_status: ["pending", "processing", "completed", "failed"],
      user_role: ["admin", "supervisor", "field_worker"],
      validation_status: ["pending", "completed", "failed", "manual_override"],
    },
  },
} as const
