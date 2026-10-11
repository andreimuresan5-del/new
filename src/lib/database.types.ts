// De regenerat cu `npx supabase gen types typescript --local > src/lib/database.types.ts`
// odată ce `supabase start` rulează, ca sursă de adevăr pentru tipurile Supabase.
// Până atunci, clientul rămâne netipizat generic — fiecare feature/api.ts declară
// propriile interfețe pentru shape-ul rândurilor pe care le folosește.

export type StaffRole = 'production_staff' | 'kitchen_manager' | 'owner' | 'marketing'
