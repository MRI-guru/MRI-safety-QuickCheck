-- Rights-safe MRI output surface
-- Keeps authored factual fields and source metadata while excluding copied labeling text/media.
create or replace function public.quickcheck_rights_safe_jsonb(p_value jsonb)
returns jsonb
language plpgsql
immutable
set search_path to ''
as $function$
declare
  v_result jsonb;
  v_key text;
  v_value jsonb;
  v_allowed constant text[] := array[
    'id','device_id','scanner_model_id','scanner_profile_id','check_id',
    'status','guidance_mode','verification_basis','exact_system_verified',
    'safe_to_scan','conditions_met','requires_review','hard_conflict',
    'condition_confirmation_required','eligible','met','confirmed','required',
    'key','condition_id','conditions','condition_checklist','sources','source',
    'mr_status','field_strength_min_t','field_strength_max_t','scan_region',
    'max_spatial_gradient_g_cm','max_slew_rate_t_m_s','max_whole_body_sar_w_kg',
    'max_head_sar_w_kg','max_b1_rms_ut','matches_selected_scanner',
    'field_strength_t','document_type','document_version','effective_date',
    'verified_at','retrieved_at','verification_status','source_url','title',
    'engine_version','exact_pathway','decision_code','body_part_status',
    'coil_status','overall_status'
  ];
begin
  if p_value is null then return null; end if;
  case jsonb_typeof(p_value)
    when 'object' then
      v_result := '{}'::jsonb;
      for v_key, v_value in select key, value from jsonb_each(p_value) loop
        if v_key = any(v_allowed) then
          v_result := v_result || jsonb_build_object(v_key, public.quickcheck_rights_safe_jsonb(v_value));
        end if;
      end loop;
      return v_result;
    when 'array' then
      select coalesce(jsonb_agg(public.quickcheck_rights_safe_jsonb(value)), '[]'::jsonb)
        into v_result from jsonb_array_elements(p_value);
      return v_result;
    else return p_value;
  end case;
end;
$function$;

create or replace function public.quickcheck_get_device_guidance_rights_safe(uuid,numeric,text)
returns jsonb language plpgsql set search_path to ''
as $function$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  return public.quickcheck_rights_safe_jsonb(public.quickcheck_get_device_guidance($1,$2,$3));
end;
$function$;

create or replace function public.quickcheck_run_exact_system_check_rights_safe(uuid,jsonb,uuid,numeric,text,text,jsonb)
returns jsonb language plpgsql set search_path to ''
as $function$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  return public.quickcheck_rights_safe_jsonb(public.quickcheck_run_exact_system_check_v4($1,$2,$3,$4,$5,$6,$7));
end;
$function$;

create or replace function public.quickcheck_run_exact_system_check_rights_safe(uuid,jsonb,uuid,numeric,text,text,jsonb,uuid)
returns jsonb language plpgsql set search_path to ''
as $function$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  return public.quickcheck_rights_safe_jsonb(public.quickcheck_run_exact_system_check_v4($1,$2,$3,$4,$5,$6,$7,$8));
end;
$function$;

create or replace function public.quickcheck_evaluate_condition_confirmation_rights_safe(uuid,uuid,numeric,text,jsonb)
returns jsonb language plpgsql set search_path to ''
as $function$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  return public.quickcheck_rights_safe_jsonb(public.quickcheck_evaluate_condition_confirmation($1,$2,$3,$4,$5));
end;
$function$;

revoke all on function public.quickcheck_get_device_guidance_rights_safe(uuid,numeric,text) from anon, public;
revoke all on function public.quickcheck_run_exact_system_check_rights_safe(uuid,jsonb,uuid,numeric,text,text,jsonb) from anon, public;
revoke all on function public.quickcheck_run_exact_system_check_rights_safe(uuid,jsonb,uuid,numeric,text,text,jsonb,uuid) from anon, public;
revoke all on function public.quickcheck_evaluate_condition_confirmation_rights_safe(uuid,uuid,numeric,text,jsonb) from anon, public;
grant execute on function public.quickcheck_get_device_guidance_rights_safe(uuid,numeric,text) to authenticated;
grant execute on function public.quickcheck_run_exact_system_check_rights_safe(uuid,jsonb,uuid,numeric,text,text,jsonb) to authenticated;
grant execute on function public.quickcheck_run_exact_system_check_rights_safe(uuid,jsonb,uuid,numeric,text,text,jsonb,uuid) to authenticated;
grant execute on function public.quickcheck_evaluate_condition_confirmation_rights_safe(uuid,uuid,numeric,text,jsonb) to authenticated;
