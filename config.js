
function SUPABASE(){
    const SUPABASE_URL = 'https://dlalyhntjqpaqaofmobp.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsYWx5aG50anFwYXFhb2Ztb2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzODE1MDQsImV4cCI6MjA1MTk1NzUwNH0.mspt_m01KhvqEmLk-eXaB54EpK2XNuLnerK7nw9WKgw';
    return supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}