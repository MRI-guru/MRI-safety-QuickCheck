-- Add original, deterministic summaries to the rights-safe API. The summary is
-- assembled from factual structured fields and presence flags; source labeling
-- prose remains excluded from the client response.

update public.device_labeling_conditions condition
set field_strength_min_t = 1.5,
    field_strength_max_t = 1.5
from public.devices device
join public.manufacturers manufacturer on manufacturer.id = device.manufacturer_id
join public.labeling_sources source
  on source.source_url = 'https://www.medtronic.com/content/dam/emanuals/neuro/M939858A_a_028_view.pdf'
where condition.device_id = device.id
  and condition.source_id = source.id
  and lower(manufacturer.name) = 'medtronic'
  and device.model = '97715'
  and condition.verified = true;

create or replace function public.quickcheck_app_authored_condition_summary(p_condition jsonb)
returns text
language plpgsql
immutable
set search_path to ''
as $function$
declare
  v_parts text[] := array[]::text[];
  v_status text := lower(coalesce(p_condition->>'mr_status', 'unknown'));
  v_min text := nullif(p_condition->>'field_strength_min_t', '');
  v_max text := nullif(p_condition->>'field_strength_max_t', '');
begin
  v_parts := array_append(v_parts, case v_status
    when 'safe' then 'The recorded classification is MR Safe.'
    when 'conditional' then 'The recorded classification is MR Conditional; every applicable condition must be satisfied.'
    when 'unsafe' then 'The recorded classification is MR Unsafe. Do not scan.'
    else 'This record provides guidance only and does not establish MRI clearance from the device model alone.'
  end);

  if v_min is not null and v_max is not null and v_min = v_max then
    v_parts := array_append(v_parts, 'The recorded field strength is ' || v_min || ' T.');
  elsif v_min is not null or v_max is not null then
    v_parts := array_append(v_parts, 'Use only the recorded field-strength range shown above.');
  else
    v_parts := array_append(v_parts, 'Field-strength eligibility must be confirmed for the exact implanted system in the linked current source.');
  end if;

  if nullif(btrim(coalesce(p_condition->>'scan_region', '')), '') is not null then
    v_parts := array_append(v_parts, 'A scan-region condition is recorded; confirm the permitted anatomy shown above.');
  end if;
  if p_condition->>'max_spatial_gradient_g_cm' is not null then
    v_parts := array_append(v_parts, 'Do not exceed the recorded spatial-gradient limit.');
  end if;
  if p_condition->>'max_slew_rate_t_m_s' is not null then
    v_parts := array_append(v_parts, 'Do not exceed the recorded gradient slew-rate limit.');
  end if;
  if p_condition->>'max_whole_body_sar_w_kg' is not null or p_condition->>'max_head_sar_w_kg' is not null then
    v_parts := array_append(v_parts, 'Do not exceed the recorded SAR limit.');
  end if;
  if p_condition->>'max_b1_rms_ut' is not null then
    v_parts := array_append(v_parts, 'Do not exceed the recorded B1+rms limit.');
  end if;
  if nullif(btrim(coalesce(p_condition->>'coil_requirements', '')), '') is not null then
    v_parts := array_append(v_parts, 'RF-coil restrictions apply and must be checked in the linked source.');
  end if;
  if nullif(btrim(coalesce(p_condition->>'operating_mode', '')), '') is not null then
    v_parts := array_append(v_parts, 'A scanner operating-mode restriction applies.');
  end if;
  if nullif(btrim(coalesce(p_condition->>'positioning_requirements', '')), '') is not null then
    v_parts := array_append(v_parts, 'Patient-position restrictions apply.');
  end if;
  if nullif(btrim(coalesce(p_condition->>'programming_requirements', '')), '') is not null then
    v_parts := array_append(v_parts, 'Complete and verify the manufacturer-required device programming or MRI mode before scanning.');
  end if;
  if nullif(btrim(coalesce(p_condition->>'monitoring_requirements', '')), '') is not null then
    v_parts := array_append(v_parts, 'Monitoring requirements apply during the MRI workflow.');
  end if;
  if nullif(btrim(coalesce(p_condition->>'lead_requirements', '')), '') is not null
     or nullif(btrim(coalesce(p_condition->>'other_conditions', '')), '') is not null then
    v_parts := array_append(v_parts, 'Confirm the complete implanted system, including every lead, extension, adaptor, and abandoned or fractured component, against the linked source.');
  end if;

  v_parts := array_append(v_parts, 'The linked current manufacturer source controls; this app-authored summary is not independent scan clearance.');
  return array_to_string(v_parts, ' ');
end;
$function$;

create or replace function public.quickcheck_attach_app_guidance_summaries(p_value jsonb)
returns jsonb
language plpgsql
immutable
set search_path to ''
as $function$
declare
  v_conditions jsonb;
begin
  if p_value is null or jsonb_typeof(p_value) <> 'object' then
    return p_value;
  end if;
  if jsonb_typeof(p_value->'conditions') <> 'array' then
    return p_value;
  end if;

  select coalesce(
    jsonb_agg(
      condition || jsonb_build_object(
        'app_guidance_summary',
        public.quickcheck_app_authored_condition_summary(condition)
      )
    ),
    '[]'::jsonb
  )
  into v_conditions
  from jsonb_array_elements(p_value->'conditions') as item(condition);

  return jsonb_set(p_value, '{conditions}', v_conditions, true);
end;
$function$;

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
    'coil_status','overall_status','app_guidance_summary'
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

create or replace function public.quickcheck_get_device_guidance_rights_safe(
  p_device_id uuid,
  p_scanner_strength_t numeric,
  p_scan_region text
)
returns jsonb language plpgsql set search_path to ''
as $function$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  return public.quickcheck_rights_safe_jsonb(
    public.quickcheck_attach_app_guidance_summaries(
      public.quickcheck_get_device_guidance($1,$2,$3)
    )
  );
end;
$function$;

create or replace function public.quickcheck_run_exact_system_check_rights_safe(
  p_device_id uuid,
  p_components jsonb,
  p_scanner_model_id uuid,
  p_scanner_strength_t numeric,
  p_scan_region text,
  p_generator_serial_number text,
  p_implant_metadata jsonb
)
returns jsonb language plpgsql set search_path to ''
as $function$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  return public.quickcheck_rights_safe_jsonb(
    public.quickcheck_attach_app_guidance_summaries(
      public.quickcheck_run_exact_system_check_v4($1,$2,$3,$4,$5,$6,$7)
    )
  );
end;
$function$;

create or replace function public.quickcheck_run_exact_system_check_rights_safe(
  p_device_id uuid,
  p_components jsonb,
  p_scanner_model_id uuid,
  p_scanner_strength_t numeric,
  p_scan_region text,
  p_generator_serial_number text,
  p_implant_metadata jsonb,
  p_scanner_profile_id uuid
)
returns jsonb language plpgsql set search_path to ''
as $function$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  return public.quickcheck_rights_safe_jsonb(
    public.quickcheck_attach_app_guidance_summaries(
      public.quickcheck_run_exact_system_check_v4($1,$2,$3,$4,$5,$6,$7,$8)
    )
  );
end;
$function$;

create or replace function public.quickcheck_evaluate_condition_confirmation_rights_safe(
  p_device_id uuid,
  p_scanner_model_id uuid,
  p_scanner_strength_t numeric,
  p_scan_region text,
  p_confirmations jsonb
)
returns jsonb language plpgsql set search_path to ''
as $function$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  return public.quickcheck_rights_safe_jsonb(
    public.quickcheck_attach_app_guidance_summaries(
      public.quickcheck_evaluate_condition_confirmation($1,$2,$3,$4,$5)
    )
  );
end;
$function$;

revoke all on function public.quickcheck_app_authored_condition_summary(jsonb) from anon, public;
revoke all on function public.quickcheck_attach_app_guidance_summaries(jsonb) from anon, public;
grant execute on function public.quickcheck_app_authored_condition_summary(jsonb) to authenticated;
grant execute on function public.quickcheck_attach_app_guidance_summaries(jsonb) to authenticated;
