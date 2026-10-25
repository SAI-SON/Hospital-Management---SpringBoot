import { Activity, PhoneCall, ShieldCheck, HeartPulse, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-navy-950 border-t border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-white">
                Medi<span className="text-brand-600 dark:text-brand-400">Book</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Transforming outpatient healthcare access. Instant discovery of top board-certified specialists, verified patient reviews, and guaranteed real-time appointment booking.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
                <ShieldCheck className="w-4 h-4" /> HIPAA & NABH Compliant
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <HeartPulse className="w-4 h-4" /> 24/7 Triage Ready
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-slate-900 dark:text-white text-sm">Patient Care</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/doctors" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Find Specialists
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Book Consultation
                </Link>
              </li>
              <li>
                <Link to="/patient/appointments" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Appointment History
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Patient Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* For Doctors */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-slate-900 dark:text-white text-sm">Medical Staff</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/register" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Join as Medical Doctor
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Doctor Portal Login
                </Link>
              </li>
              <li>
                <Link to="/doctor/availability" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Availability Management
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Admin System Oversight
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency Hotline card */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-slate-900 dark:text-white text-sm">24/7 Emergency</h4>
            <div className="p-4 rounded-2xl bg-coral-50 dark:bg-coral-950/40 border border-coral-200 dark:border-coral-900/60 text-coral-950 dark:text-coral-200 space-y-2">
              <div className="flex items-center gap-2 text-coral-600 dark:text-coral-400 font-bold text-sm">
                <PhoneCall className="w-4 h-4 animate-bounce" />
                <span>Hotline: 1800-MED-911</span>
              </div>
              <p className="text-[11px] text-coral-800 dark:text-coral-300">
                For life-threatening emergencies, call emergency services immediately.
              </p>
            </div>
            <div className="text-xs space-y-1 text-slate-500">
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> support@medibook.com
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> 100 Hospital Ave, Medical City
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} MediBook Hospital System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
