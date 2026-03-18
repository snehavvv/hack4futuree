SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict 3vHfmOjhdClQx9akUXg1NuY2Xxz9bJ9hN4D1gXa0BoJhYhg1RdkGJIBBbwVIWI7

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '813f8e6c-d2a1-4c0c-bbd2-044b8dabb618', '{"action":"user_signedup","actor_id":"636abd4f-470b-4829-870c-f32bb980048b","actor_username":"sudeepa.santhanam@mca.christuniversity.in","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2026-03-17 21:49:03.200313+00', ''),
	('00000000-0000-0000-0000-000000000000', '18135365-1ca4-40d2-98da-f7047786931f', '{"action":"login","actor_id":"636abd4f-470b-4829-870c-f32bb980048b","actor_username":"sudeepa.santhanam@mca.christuniversity.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 21:49:03.211484+00', ''),
	('00000000-0000-0000-0000-000000000000', 'da0acbd1-7a35-4273-9a19-7baf08cf1e29', '{"action":"login","actor_id":"636abd4f-470b-4829-870c-f32bb980048b","actor_username":"sudeepa.santhanam@mca.christuniversity.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 21:50:39.409957+00', ''),
	('00000000-0000-0000-0000-000000000000', '0fcaddc1-6734-460f-bc99-ec2ec692447b', '{"action":"logout","actor_id":"636abd4f-470b-4829-870c-f32bb980048b","actor_username":"sudeepa.santhanam@mca.christuniversity.in","actor_via_sso":false,"log_type":"account"}', '2026-03-17 21:52:53.191093+00', ''),
	('00000000-0000-0000-0000-000000000000', '923d95db-e242-4a52-90e8-460d5b9aaf50', '{"action":"login","actor_id":"636abd4f-470b-4829-870c-f32bb980048b","actor_username":"sudeepa.santhanam@mca.christuniversity.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 22:01:26.946444+00', '');


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '636abd4f-470b-4829-870c-f32bb980048b', 'authenticated', 'authenticated', 'sudeepa.santhanam@mca.christuniversity.in', '$2a$10$AzQ7y6AoO1HuWK.aShVMBu506gcvjBf6Dh.hMak5gVL9q2D1swynu', '2026-03-17 21:49:03.20163+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-17 22:01:26.947767+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "636abd4f-470b-4829-870c-f32bb980048b", "email": "sudeepa.santhanam@mca.christuniversity.in", "display_name": "Sudeepa Santhanam", "email_verified": true, "phone_verified": false}', NULL, '2026-03-17 21:49:03.190101+00', '2026-03-17 22:01:26.951606+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('636abd4f-470b-4829-870c-f32bb980048b', '636abd4f-470b-4829-870c-f32bb980048b', '{"sub": "636abd4f-470b-4829-870c-f32bb980048b", "email": "sudeepa.santhanam@mca.christuniversity.in", "display_name": "Sudeepa Santhanam", "email_verified": false, "phone_verified": false}', 'email', '2026-03-17 21:49:03.197609+00', '2026-03-17 21:49:03.197639+00', '2026-03-17 21:49:03.197639+00', '8161311d-a65c-40bc-b741-3f4559e83f5c');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('d03d914b-10f5-4578-a281-22b32d20cd2a', '636abd4f-470b-4829-870c-f32bb980048b', '2026-03-17 22:01:26.947838+00', '2026-03-17 22:01:26.947838+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '172.18.0.1', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('d03d914b-10f5-4578-a281-22b32d20cd2a', '2026-03-17 22:01:26.952436+00', '2026-03-17 22:01:26.952436+00', 'password', 'fcad222c-4137-4e69-8c72-becb0dde8546');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 3, 'gfmzpbrzy3ec', '636abd4f-470b-4829-870c-f32bb980048b', false, '2026-03-17 22:01:26.949999+00', '2026-03-17 22:01:26.949999+00', NULL, 'd03d914b-10f5-4578-a281-22b32d20cd2a');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: analyses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: analysis_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "display_name", "avatar_url", "account_tier", "created_at", "updated_at") VALUES
	('636abd4f-470b-4829-870c-f32bb980048b', 'sudeepa.santhanam', NULL, 'free', '2026-03-17 21:49:03.189806+00', '2026-03-17 21:49:03.189806+00');


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: suggestions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('squint-images', 'squint-images', NULL, '2026-03-17 21:38:36.592091+00', '2026-03-17 21:38:36.592091+00', false, false, NULL, NULL, NULL, 'STANDARD')
ON CONFLICT (id) DO NOTHING;


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 3, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict 3vHfmOjhdClQx9akUXg1NuY2Xxz9bJ9hN4D1gXa0BoJhYhg1RdkGJIBBbwVIWI7

RESET ALL;
