import React, { useState, useEffect } from "react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import authService from "../../services/authService";
import toast from "react-hot-toast";
import { User, Lock, Mail } from "lucide-react";

const ProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await authService.getProfile();
        setUsername(data.username);
        setEmail(data.email);
      } catch (error) {
        toast.error("Failed to fetch profile.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("New Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New Password must be at least 6 characters long.");
      return;
    }
    setPasswordLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      toast.error(error.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Profile Settings" />

      <div className="space-y-8">
        {/*User info display*/}
        <div className="bg-white border border-neutral-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            User Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-4 w-4 text-neutral-400" />
                </div>
                <p className="w-full h-9 pl-9 border border-neutral-200 rounded-lg bg-neutral-50 text-sm text-neutral-900 flex items-center">
                  {username}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-4 h-4 text-neutral-400" />
                </div>
                <p className="w-full h-9 pl-9 border border-neutral-200 rounded-lg bg-neutral-50 text-sm text-neutral-900  flex items-center">
                  {email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/*Change Password Form*/}
        <div className="bg-white border border-neutral-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Change Password
          </h3>
          <form className="space-y-4" onSubmit={handleChangePassword}>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-9 pl-9 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-900
                             placeholder-neutral-400 tranition-colors duration-150 focus:outline-none focus:ring-2
                             focus:border-transparent focus:ring-[#00d492] flex items-center"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-4 h-4 text-neutral-400" />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-9 pl-9 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-900
                             placeholder-neutral-400 tranition-colors duration-150 focus:outline-none focus:ring-2
                             focus:border-transparent focus:ring-[#00d492] flex items-center"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-4 h-4 text-neutral-400" />
                </div>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full h-9 pl-9 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-900
                             placeholder-neutral-400 tranition-colors duration-150 focus:outline-none focus:ring-2
                             focus:border-transparent focus:ring-[#00d492] flex items-center"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Changing Password..." : "Change Password"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
