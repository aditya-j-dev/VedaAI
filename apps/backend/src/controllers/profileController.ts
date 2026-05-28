import { Request, Response, NextFunction } from 'express';
import { School } from '../models/School';
import { Teacher } from '../models/Teacher';

// Now uses JWT-authenticated teacher instead of seeded data
export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const teacher = await Teacher.findById(req.teacher!.teacherId).lean();
    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher not found' });
      return;
    }

    const school = teacher.schoolId ? await School.findById(teacher.schoolId).lean() : null;

    res.json({
      success: true,
      data: {
        teacher: {
          _id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          avatarUrl: teacher.avatarUrl,
        },
        school: {
          _id: school?._id ?? null,
          name: school?.name ?? '',
          location: school?.location ?? '',
          logoUrl: school?.logoUrl ?? null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, schoolName, schoolLocation } = req.body;
    
    // Ensure teacher exists
    const teacher = await Teacher.findById(req.teacher!.teacherId);
    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher not found' });
      return;
    }

    // Update teacher details
    if (name) teacher.name = name;

    // Handle avatar upload if file is present
    if (req.file) {
      // Convert buffer to base64 for easy database storage
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const mime = req.file.mimetype;
      teacher.avatarUrl = `data:${mime};base64,${b64}`;
    }

    await teacher.save();

    // Update or create school
    let school = null;
    if (schoolName || schoolLocation) {
      if (teacher.schoolId) {
        school = await School.findByIdAndUpdate(
          teacher.schoolId,
          { 
            ...(schoolName && { name: schoolName }),
            ...(schoolLocation && { location: schoolLocation })
          },
          { new: true }
        ).lean();
      } else {
        // Fallback if school was never set
        const newSchool = await School.create({
          name: schoolName ?? 'My School',
          location: schoolLocation ?? 'Unknown Location'
        });
        teacher.schoolId = newSchool._id;
        await teacher.save();
        school = newSchool.toObject();
      }
    } else if (teacher.schoolId) {
      school = await School.findById(teacher.schoolId).lean();
    }

    res.json({
      success: true,
      data: {
        teacher: {
          _id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          avatarUrl: teacher.avatarUrl,
        },
        school: {
          _id: school?._id ?? null,
          name: school?.name ?? '',
          location: school?.location ?? '',
          logoUrl: school?.logoUrl ?? null,
        },
      }
    });

  } catch (err) {
    next(err);
  }
}
