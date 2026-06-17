import MyServicesView from '@/view/servicoPrestador';

export const metadata = {
  title: 'Meus Serviços - Benvi',
  description: 'Gerencie os serviços oferecidos na plataforma Benvi',
};

// A page atua estritamente como ponto de entrada da rota
export default function MyServicesPage() {
  return <MyServicesView />;
}