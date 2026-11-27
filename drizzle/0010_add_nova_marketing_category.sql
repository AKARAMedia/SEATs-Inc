-- News category for NOVA MARKETING (shown in the admin post "Category" dropdown). Appended after the
-- existing categories; safe to re-run.
INSERT INTO "categories" ("slug", "name_en", "name_ja", "sort_order")
VALUES ('nova-marketing', 'NOVA MARKETING', 'NOVA MARKETING', (SELECT COALESCE(MAX("sort_order"), -1) + 1 FROM "categories"))
ON CONFLICT ("slug") DO NOTHING;
