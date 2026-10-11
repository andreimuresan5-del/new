-- Schema de culori a brandului pentru materialele generate (story etc.);
-- valorile sunt cheile din COLOR_SCHEMES (src/features/marketing/storyRenderer.ts).
alter table marketing_brands add column color_scheme text not null default 'clasic';
