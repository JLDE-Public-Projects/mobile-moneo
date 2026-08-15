import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FloatingTabBar, TabItemConfig } from '@/components/organisms/FloatingTabBar';
import { HomeIcon } from '@/components/icons/HomeIcon';
import { MovementsIcon } from '@/components/icons/MovementsIcon';
import { ExpensesIcon } from '@/components/icons/ExpensesIcon';
import { AccountsIcon } from '@/components/icons/AccountsIcon';
import { HomeScreen } from '@/screens/main/HomeScreen';
import { MovementsScreen } from '@/screens/main/MovementsScreen';
import { ExpensesScreen } from '@/screens/main/ExpensesScreen';
import { AccountsScreen } from '@/screens/main/AccountsScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { CategoriesScreen } from '@/screens/settings/CategoriesScreen';
import { BudgetScreen } from '@/screens/settings/BudgetScreen';
import { ProfileScreen } from '@/screens/settings/ProfileScreen';
import { CategoryDetailScreen } from '@/screens/main/CategoryDetailScreen';
import { HistoryScreen } from '@/screens/main/HistoryScreen';
import { RecurringsScreen } from '@/screens/main/RecurringsScreen';
import { AddTransactionModal } from '@/components/organisms/AddTransactionModal';
import { Transaction } from '@/services/transactions/transaction.types';
import { colors } from '@/theme';

/** Identificadores de los tabs principales. */
type TabId = 'home' | 'tx' | 'gastos' | 'accounts';

/** Pantallas de detalle que se muestran por encima de los tabs. */
type DetailScreen =
  | 'settings'
  | 'categories'
  | 'budget'
  | 'catDetail'
  | 'profile'
  | 'history'
  | 'subs'
  | null;

/**
 * Navegador principal de la app autenticada.
 *
 * Coordina las sub-páginas con la barra de navegación flotante, y además maneja
 * pantallas de "detalle" (como Ajustes) que se muestran por encima del tab
 * activo manteniendo la barra visible. Seleccionar un tab cierra el detalle.
 *
 * Es un navegador propio y ligero (sin dependencias externas), suficiente para
 * este diseño a medida; si más adelante se necesita enrutado profundo, puede
 * migrarse a una librería de navegación conservando esta misma estructura.
 */
export function MainNavigator() {
  const { t } = useTranslation();
  // Configuración de los tabs: id, etiqueta e ícono. Es una función y no una
  // constante de módulo porque las etiquetas dependen del idioma activo.
  const TABS: TabItemConfig[] = [
    { id: 'home', label: t('settings.backToHome'), Icon: HomeIcon },
    { id: 'tx', label: t('movements.title'), Icon: MovementsIcon },
    { id: 'gastos', label: t('expenses.title'), Icon: ExpensesIcon },
    { id: 'accounts', label: t('accounts.title'), Icon: AccountsIcon },
  ];
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [detail, setDetail] = useState<DetailScreen>(null);
  const [addOpen, setAddOpen] = useState(false);
  // Movimiento abierto para editar; null cuando se está registrando uno nuevo.
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  // A dónde volver desde Presupuesto (se abre desde Ajustes o desde Gastos).
  const [budgetReturn, setBudgetReturn] = useState<DetailScreen>(null);
  // Categoría abierta en el detalle (desde Gastos).
  const [detailCategory, setDetailCategory] = useState('');

  const openBudget = (from: DetailScreen) => {
    setBudgetReturn(from);
    setDetail('budget');
  };

  const openTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setAddOpen(true);
  };

  const openCategory = (name: string) => {
    setDetailCategory(name);
    setDetail('catDetail');
  };

  // Renderiza la pantalla del tab activo con sus callbacks de navegación.
  // El acceso a Ajustes (engranaje) está presente en las cuatro pestañas.
  const renderTab = () => {
    const openSettings = () => setDetail('settings');
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onOpenSettings={openSettings}
            onSeeAllMovements={() => setActiveTab('tx')}
            onOpenRecurrings={() => setDetail('subs')}
            onOpenHistory={() => setDetail('history')}
          />
        );
      case 'tx':
        return (
          <MovementsScreen
            onOpenSettings={openSettings}
            onOpenTransaction={openTransaction}
          />
        );
      case 'gastos':
        return (
          <ExpensesScreen
            onOpenSettings={openSettings}
            onOpenBudget={() => openBudget(null)}
            onOpenCategory={openCategory}
          />
        );
      case 'accounts':
        return <AccountsScreen onOpenSettings={openSettings} />;
    }
  };

  // El detalle (si existe) tiene prioridad sobre el contenido del tab.
  const renderContent = () => {
    if (detail === 'settings') {
      return (
        <SettingsScreen
          onBack={() => setDetail(null)}
          onOpenCategories={() => setDetail('categories')}
          onOpenBudget={() => openBudget('settings')}
          onOpenProfile={() => setDetail('profile')}
        />
      );
    }
    if (detail === 'profile') {
      return <ProfileScreen onBack={() => setDetail('settings')} />;
    }
    if (detail === 'history') {
      return <HistoryScreen onBack={() => setDetail(null)} />;
    }
    if (detail === 'subs') {
      return <RecurringsScreen onBack={() => setDetail(null)} />;
    }
    if (detail === 'categories') {
      return <CategoriesScreen onBack={() => setDetail('settings')} />;
    }
    if (detail === 'budget') {
      return <BudgetScreen onBack={() => setDetail(budgetReturn)} />;
    }
    if (detail === 'catDetail') {
      return (
        <CategoryDetailScreen
          categoryName={detailCategory}
          onBack={() => setDetail(null)}
        />
      );
    }
    return renderTab();
  };

  // Las pantallas profundas (detalles) ocultan la barra de tabs.
  const DEEP_DETAILS: DetailScreen[] = [
    'categories',
    'budget',
    'catDetail',
    'profile',
    'history',
    'subs',
  ];
  const showTabBar = !DEEP_DETAILS.includes(detail);

  return (
    <View style={styles.container}>
      {renderContent()}
      {showTabBar && (
        <FloatingTabBar
          tabs={TABS}
          activeId={activeTab}
          onSelect={(id) => {
            // Cambiar de tab cierra cualquier pantalla de detalle abierta.
            setDetail(null);
            setActiveTab(id as TabId);
          }}
          onAdd={() => {
            // El botón siempre registra uno nuevo, aunque antes se hubiera
            // abierto un movimiento para editarlo.
            setEditingTransaction(null);
            setAddOpen(true);
          }}
        />
      )}

      <AddTransactionModal
        visible={addOpen}
        transaction={editingTransaction}
        onClose={() => {
          setAddOpen(false);
          setEditingTransaction(null);
        }}
        // Sin cuentas no se puede registrar nada: se cierra el modal y se lleva
        // al usuario a crear la primera.
        onOpenAccounts={() => {
          setAddOpen(false);
          setDetail(null);
          setActiveTab('accounts');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
