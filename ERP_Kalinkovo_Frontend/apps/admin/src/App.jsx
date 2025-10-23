import { Outlet, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { tokens, authApi, permissionsApi } from "./api";

export default function App() {
  const [user, setUser] = useState(tokens.user);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      const u = tokens.user;
      if (!u) return setLoading(false);
      setUser(u);

      try {
        // Р В Р вЂ Р РЋРІвЂћСћР вЂ™Р’В Р В РЎвЂ”Р РЋРІР‚ВР В Р РЏ Р В Р’В Р Р†Р вЂљР’ВР В Р’В Р Р†Р вЂљРЎС›Р В Р’В Р вЂ™Р’В Р В Р’В Р В РЎвЂњР В Р’В Р РЋРЎв„ў Р В Р’В Р РЋРЎвЂєР В Р’В Р РЋРІР‚С”Р В Р’В Р Р†Р вЂљРЎвЂќР В Р’В Р вЂ™Р’В¬Р В Р’В Р РЋРІвЂћСћР В Р’В Р РЋРІР‚С” permission_key
        const perms = await permissionsApi.user(u.id);
        const keys = Array.isArray(perms)
          ? perms.map(p => p.permission_key).filter(Boolean)
          : [];
        setUserPermissions(keys);
        // Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В±Р В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р’В Р В РІР‚В  localStorage Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р РЏ Protected
        localStorage.setItem("userPermissions", JSON.stringify(keys));
      } catch (err) {
        console.warn("Р В Р’В Р РЋРЎС™Р В Р’В Р вЂ™Р’Вµ Р В Р Р‹Р РЋРІР‚СљР В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р В Р вЂ° Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р Р‹Р РЋРІР‚СљР В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ° Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В° Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р РЏ:", err?.message);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Р В Р’В Р Р†Р вЂљРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В° Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎвЂєР В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р РЏ...</div>;
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <div className="text-lg">Р В Р’В Р РЋРЎС™Р В Р’В Р вЂ™Р’Вµ Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦</div>
        <a href="/login" className="text-blue-600 underline">Р В Р’В Р РЋРЎСџР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р’В Р Р†РІР‚С›РІР‚вЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚Сњ Р В Р’В Р В РІР‚В Р В Р Р‹Р Р†Р вЂљР’В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р Р‹Р РЋРІР‚Сљ</a>
      </div>
    );
  }

  const role = (user?.role || "").toLowerCase();
  const isAdmin = role === "admin";

  // Р В Р вЂ Р РЋРЎв„ўР Р†Р вЂљР’В¦ Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р Р‹Р В Р РЏР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚Сћ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚Сћ Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В РІР‚в„–Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋР’В
  const canManageUsers = isAdmin || userPermissions.includes("manage_users");
  const canViewMonitor = isAdmin || userPermissions.includes("monitor_view") || userPermissions.includes("monitor:read");
  const canEditProducts = isAdmin || userPermissions.includes("product_edit");

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="bg-gray-900 text-gray-100 p-4">
        <div className="mb-6">
          <div className="text-xl font-bold">ERP Kalinkovo</div>
          <div className="text-xs text-gray-400">Р В Р’В Р РЋРІР‚в„ўР В Р’В Р СћРІР‚ВР В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В¦-Р В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°</div>
        </div>

        <nav className="space-y-1">
          <NavLink
            to="/storages"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-800"}`
            }
          >
            Р В Р’В Р СћРЎвЂ™Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚В
          </NavLink>

          {canViewMonitor && (
            <NavLink
              to="/monitors"
              className={({ isActive }) =>
                `block px-3 py-2 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-800"}`
              }
            >
              Р В Р’В Р РЋРЎСџР В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ° Р В Р Р‹Р Р†Р вЂљР’В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В 
            </NavLink>
          )}

          {canEditProducts && (
            <NavLink
              to="/product-types"
              className={({ isActive }) =>
                `block px-3 py-2 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-800"}`
              }
            >
              Р В Р’В Р РЋРЎвЂєР В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚вЂќР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“ Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р Р‹Р РЋРІР‚СљР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В 
            </NavLink>
          )}

          {canManageUsers && (
            <>
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded ${isActive ? "bg-blue-800" : "hover:bg-blue-900"}`
                }
              >
                Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚В
              </NavLink>

              <NavLink
                to="/permissions"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded ${isActive ? "bg-purple-800" : "hover:bg-purple-900"}`
                }
              >
                Р В Р’В Р РЋРЎСџР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В° Р В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р РЋРІР‚СљР В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’В°
              </NavLink>

              <NavLink
                to="/system-status"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded ${isActive ? "bg-green-800" : "hover:bg-green-900"}`
                }
              >
                Р В Р’В Р РЋРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚вЂњ Р В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°
              </NavLink>
            </>
          )}
        </nav>

        {/* Р В Р’В Р РЋРЎСџР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎвЂєР В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ° */}
        <div className="mt-8 border-t border-gray-700 pt-4 text-sm">
          <div className="text-gray-300">
            {user?.name || user?.login || "Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°"}
          </div>
          <div className="text-gray-500">{user?.role || "user"}</div>
          <button
            onClick={() => authApi.logout()}
            className="mt-3 inline-block px-3 py-1 rounded bg-red-700 hover:bg-red-600"
          >
            Р В Р’В Р Р†Р вЂљРІвЂћСћР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р Р†РІР‚С›РІР‚вЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚В
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="bg-white text-gray-900">
        <Outlet />
      </main>
    </div>
  );
}
