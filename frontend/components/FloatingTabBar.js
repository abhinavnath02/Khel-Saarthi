import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { Text, PlatformPressable } from '@react-navigation/elements';
import { Ionicons } from '@expo/vector-icons';

function FloatingTabBar({ state, descriptors, navigation }) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  return (
    <View style={styles.tabBarContainer}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={100} tint="extraLight" style={styles.blurContainer}>
          <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Get icon name based on route
          let iconName;
          if (route.name === 'HomeStack') iconName = isFocused ? 'home' : 'home-outline';
          else if (route.name === 'VenueStack') iconName = isFocused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'NewsStack') iconName = isFocused ? 'newspaper' : 'newspaper-outline';
          else if (route.name === 'ProfileStack') iconName = isFocused ? 'person' : 'person-outline';

          return (
            <PlatformPressable
              key={route.key}
              href={buildHref(route.name, route.params)}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              <View style={[
                styles.tabItemContainer,
                isFocused && styles.tabItemFocused
              ]}>
                <Ionicons
                  name={iconName}
                  size={isFocused ? 28 : 24}
                  color={isFocused ? '#007AFF' : '#8E8E93'}
                />
                {!isFocused && (
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: '#8E8E93' }
                    ]}
                  >
                    {label}
                  </Text>
                )}
              </View>
            </PlatformPressable>
          );
        })}
          </View>
        </BlurView>
      ) : (
        <View style={[styles.blurContainer, styles.androidBlur]}>
          <View style={styles.tabBar}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                    ? options.title
                    : route.name;

              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
                });
              };

              // Get icon name based on route
              let iconName;
              if (route.name === 'HomeStack') iconName = isFocused ? 'home' : 'home-outline';
              else if (route.name === 'VenueStack') iconName = isFocused ? 'calendar' : 'calendar-outline';
              else if (route.name === 'NewsStack') iconName = isFocused ? 'newspaper' : 'newspaper-outline';
              else if (route.name === 'ProfileStack') iconName = isFocused ? 'person' : 'person-outline';

              return (
                <PlatformPressable
                  key={route.key}
                  href={buildHref(route.name, route.params)}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarButtonTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.tabButton}
                >
                  <View style={[
                    styles.tabItemContainer,
                    isFocused && styles.tabItemFocused
                  ]}>
                    <Ionicons
                      name={iconName}
                      size={isFocused ? 28 : 24}
                      color={isFocused ? '#007AFF' : '#8E8E93'}
                    />
                    {!isFocused && (
                      <Text
                        style={[
                          styles.tabLabel,
                          { color: '#8E8E93' }
                        ]}
                      >
                        {label}
                      </Text>
                    )}
                  </View>
                </PlatformPressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  blurContainer: {
    borderRadius: 25,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  androidBlur: {
    backgroundColor: 'rgba(248, 249, 250, 0.95)',
    ...Platform.select({
      android: {
        elevation: 8,
      },
    }),
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  tabItemFocused: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default FloatingTabBar;
