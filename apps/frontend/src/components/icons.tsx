/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faArrowRight, faArrowUpRightFromSquare,
  faBookBookmark, faChalkboardTeacher, faCircle, faCirclePlus, faCompress,
  faCrop, faExpand, faFileCirclePlus, faListOl, faTrophy,
  faAward, faBars, faBell, faBolt, faBookOpen, faBookmark,
  faBriefcase, faBullseye, faCalendar, faCalendarCheck, faChartLine,
  faCheck, faCheckCircle, faCheckDouble, faChevronDown,
  faChevronLeft, faChevronRight, faChevronUp,
  faCircleCheck, faCircleExclamation, faCircleQuestion,
  faClock, faCloudArrowDown, faComment, faComments,
  faCompass, faDatabase, faDoorOpen,
  faDownload, faEnvelope, faEye, faEyeSlash,
  faFileExcel, faFileLines, faFilePen, faFilter, faFlag,
  faFloppyDisk, faFolderOpen, faGaugeHigh, faGear,
  faGlobe, faGraduationCap, faHeart, faInfoCircle,
  faKey, faLayerGroup, faLink, faListCheck,
  faLock, faMagnifyingGlass, faMicrochip,
  faPaperPlane, faPenToSquare, faPhone, faPlay,
  faPlus, faPuzzlePiece, faReply, faRightFromBracket,
  faRotate, faRotateLeft, faStar,
  faTrashCan, faTriangleExclamation, faUpload,
  faUser, faUsers, faVideo, faWandMagicSparkles,
  faXmark, faTurnDown, faAt,
  faCamera, faListUl, faShield, faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import type { FontAwesomeIconProps } from '@fortawesome/react-fontawesome';

type IconProps = Partial<FontAwesomeIconProps> & {
  className?: string;
  size?: number;
};

function makeIcon(icon: any) {
  return ({ className, size: _size, ...props }: IconProps) => (
    <FontAwesomeIcon icon={icon} className={className} {...props} />
  );
}

export const Activity = makeIcon(faChartLine);
export const AlertCircle = makeIcon(faCircleExclamation);
export const AlertTriangle = makeIcon(faTriangleExclamation);
export const ArrowLeft = makeIcon(faArrowLeft);
export const ArrowRight = makeIcon(faArrowRight);
export const ArrowUpRight = makeIcon(faArrowUpRightFromSquare);
export const AtSign = makeIcon(faAt);
export const Award = makeIcon(faAward);
export const BarChart3 = makeIcon(faChartLine);
export const Bell = makeIcon(faBell);
export const BookOpen = makeIcon(faBookOpen);
export const Bolt = makeIcon(faBolt);
export const BookmarkCheck = makeIcon(faBookmark);
export const BookMarked = makeIcon(faBookBookmark);
export const Briefcase = makeIcon(faBriefcase);
export const Calendar = makeIcon(faCalendar);
export const CalendarCheck = makeIcon(faCalendarCheck);
export const Camera = makeIcon(faCamera);
export const ChalkboardTeacher = makeIcon(faChalkboardTeacher);
export const Check = makeIcon(faCheck);
export const CheckCheck = makeIcon(faCheckDouble);
export const CheckCircle = makeIcon(faCheckCircle);
export const CheckCircle2 = makeIcon(faCircleCheck);
export const ChevronDown = makeIcon(faChevronDown);
export const Circle = makeIcon(faCircle);
export const ChevronLeft = makeIcon(faChevronLeft);
export const ChevronRight = makeIcon(faChevronRight);
export const ChevronUp = makeIcon(faChevronUp);
export const Clock = makeIcon(faClock);
export const Compass = makeIcon(faCompass);
export const CornerDownRight = makeIcon(faTurnDown);
export const Cpu = makeIcon(faMicrochip);
export const Crop = makeIcon(faCrop);
export const Database = makeIcon(faDatabase);
export const DoorOpen = makeIcon(faDoorOpen);
export const Download = makeIcon(faDownload);
export const DownloadCloud = makeIcon(faCloudArrowDown);
export const Edit = makeIcon(faPenToSquare);
export const ExternalLink = makeIcon(faArrowUpRightFromSquare);
export const Eye = makeIcon(faEye);
export const EyeOff = makeIcon(faEyeSlash);
export const FileSpreadsheet = makeIcon(faFileExcel);
export const FileText = makeIcon(faFileLines);
export const FilePlus = makeIcon(faFileCirclePlus);
export const FilePen = makeIcon(faFilePen);
export const Filter = makeIcon(faFilter);
export const Flag = makeIcon(faFlag);
export const FolderOpen = makeIcon(faFolderOpen);
export const Globe = makeIcon(faGlobe);
export const GraduationCap = makeIcon(faGraduationCap);
export const Heart = makeIcon(faHeart);
export const HelpCircle = makeIcon(faCircleQuestion);
export const Info = makeIcon(faInfoCircle);
export const KeyRound = makeIcon(faKey);
export const Layers = makeIcon(faLayerGroup);
export const LayoutDashboard = makeIcon(faGaugeHigh);
export const Link = makeIcon(faLink);
export const ListChecks = makeIcon(faListCheck);
export const ListUl = makeIcon(faListUl);
export const Lock = makeIcon(faLock);
export const LogOut = makeIcon(faRightFromBracket);
export const Mail = makeIcon(faEnvelope);
export const Maximize2 = makeIcon(faExpand);
export const Menu = makeIcon(faBars);
export const Minimize2 = makeIcon(faCompress);
export const MessageCircle = makeIcon(faComments);
export const MessageSquare = makeIcon(faComment);
export const Phone = makeIcon(faPhone);
export const Play = makeIcon(faPlay);
export const PlusCircle = makeIcon(faCirclePlus);
export const Plus = makeIcon(faPlus);
export const Puzzle = makeIcon(faPuzzlePiece);
export const RefreshCw = makeIcon(faRotate);
export const Reply = makeIcon(faReply);
export const RotateCcw = makeIcon(faRotateLeft);
export const Save = makeIcon(faFloppyDisk);
export const Search = makeIcon(faMagnifyingGlass);
export const Send = makeIcon(faPaperPlane);
export const Settings = makeIcon(faGear);
export const ShieldAlert = makeIcon(faShield);
export const ShieldCheck = makeIcon(faShieldHalved);
export const Sparkles = makeIcon(faWandMagicSparkles);
export const Star = makeIcon(faStar);
export const Target = makeIcon(faBullseye);
export const Trash2 = makeIcon(faTrashCan);
export const Trophy = makeIcon(faTrophy);
export const ListOrdered = makeIcon(faListOl);
export const Upload = makeIcon(faUpload);
export const User = makeIcon(faUser);
export const Users = makeIcon(faUsers);
export const Video = makeIcon(faVideo);
export const X = makeIcon(faXmark);
export const Zap = makeIcon(faBolt);
export const Tag = makeIcon(faBookmark);
export const Share2 = makeIcon(faArrowUpRightFromSquare);
